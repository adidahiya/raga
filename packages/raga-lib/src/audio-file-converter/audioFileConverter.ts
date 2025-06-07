import { createReadStream, existsSync, mkdirSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { BasicTrackDefinition } from "@adahiya/raga-types";
import ffmpeg from "fluent-ffmpeg";

import {
  DEFAULT_AUDIO_SAMPLE_RATE,
  DEFAULT_MP3_BITRATE,
  LIB_PACKAGE_NAME,
} from "../common/constants.js";
import { LibErrors } from "../common/errrorMessages.js";
import { log } from "../utils/log.js";

export interface MP3ConversionOptions {
  /** @default 320 */
  bitrate?: number;

  /** "libmp3lame" is preferred */
  codec: string;

  /**
   * Force a re-conversion even if the output file already exists on disk.
   *
   * @default false
   */
  force?: boolean;

  /**
   * The kind of directory where the output file will be written, either:
   *  - temporary (creates a temp OS dir path which includes the track ID)
   *  - permament (same directory as the input file)
   */
  outputDirKind: "temporary" | "permanent";

  /** @default 44100 */
  sampleRate?: number;
}

export default class AudioFileConverter {
  public temporaryOutputDir: string;

  private get ffmpeg() {
    return this.options.ffmpeg ?? ffmpeg;
  }

  constructor(private options: { ffmpeg?: typeof ffmpeg }) {
    // N.B. the `tempy` package is not compatible with Vite for some strange reason, so we
    // create temp directories ourself with built-in Node.js APIs
    const tempDir = join(tmpdir(), LIB_PACKAGE_NAME, "converted");

    log.debug(`Creating temporary folder for audio conversion output ${tempDir}`);
    mkdirSync(tempDir, { recursive: true });

    if (!existsSync(tempDir)) {
      throw new Error(LibErrors.TEMP_DIR_UNAVAILABLE);
    }

    this.temporaryOutputDir = tempDir;
  }

  /**
   * Returns a record of all the converted MP3 file locations (keyed by track ID) in the temporary output directory.
   */
  public getAllConvertedMP3s(): Record<string, string> {
    if (!existsSync(this.temporaryOutputDir)) {
      return {};
    }

    const convertedMP3s: Record<string, string> = {};
    const trackDirs = readdirSync(this.temporaryOutputDir);
    for (const trackDir of trackDirs) {
      // dir name is like "track-id-123"
      const trackID = trackDir.split("-")[2];
      const resolvedTrackDir = resolve(this.temporaryOutputDir, trackDir);
      // just take the first MP3 file in the dir, it's very unlikely that there are multiple
      // TODO: consider picking the most recently modified file
      const mp3File = readdirSync(resolvedTrackDir).find((f) => f.endsWith(".mp3"));
      if (mp3File === undefined) {
        log.error(`No converted MP3 file found in ${resolvedTrackDir}`);
        continue;
      }
      convertedMP3s[trackID] = join(this.temporaryOutputDir, trackDir, mp3File);
    }

    return convertedMP3s;
  }

  /**
   * Converts an audio file input stream to an MP3 file at the specified output path using ffmpeg.
   *
   * NOTE: this requires `ffmpeg` to be installed and available on the system path.
   *
   * @returns the output file path on disk, if successful
   * @throws if the output file path could not be created on disk
   */
  public async convertAudioFileToMP3(
    trackDef: BasicTrackDefinition,
    options: MP3ConversionOptions,
  ): Promise<string> {
    const inputFilePath = fileURLToPath(trackDef.Location);
    const {
      bitrate = DEFAULT_MP3_BITRATE,
      codec,
      force = false,
      outputDirKind,
      sampleRate = DEFAULT_AUDIO_SAMPLE_RATE,
    } = options;

    const inputFileStream = createReadStream(inputFilePath);
    const outputFileName = basename(inputFilePath).replace(extname(inputFilePath), ".mp3");
    const outputFolder =
      outputDirKind === "temporary"
        ? this.createTempOutputDirForTrack(trackDef)
        : dirname(inputFilePath);
    const outputFilePath = join(outputFolder, outputFileName);

    if (existsSync(outputFilePath)) {
      if (force) {
        log.info(
          `MP3 file already exists at ${outputFilePath}, but force flag is set, re-converting...`,
        );
      } else {
        log.info(`MP3 file already exists at ${outputFilePath}, skipping conversion.`);
        return Promise.resolve(outputFilePath);
      }
    }

    return new Promise<string>((resolve, reject) => {
      console.time(`convertAudioFileToMP3`);
      this.ffmpeg(inputFileStream)
        .audioCodec(codec)
        .audioBitrate(bitrate)
        .audioFrequency(sampleRate)
        .noVideo()
        .save(outputFilePath)
        .on("end", () => {
          console.timeEnd(`convertAudioFileToMP3`);
          log.debug(`Wrote converted MP3 at ${outputFilePath}`);
          resolve(outputFilePath);
        })
        .on("error", (err: Error) => {
          reject(err);
        });
    });
  }

  public cleanup() {
    throw new Error(LibErrors.UNIMPLEMENTED);
  }

  /** @throws if unable to create output dir */
  private createTempOutputDirForTrack(trackDef: BasicTrackDefinition): string {
    const outputDir = join(this.temporaryOutputDir, `track-id-${trackDef["Track ID"].toString()}`);
    mkdirSync(outputDir, { recursive: true });
    if (!existsSync(outputDir)) {
      throw new Error(LibErrors.TEMP_DIR_UNAVAILABLE);
    }
    return outputDir;
  }
}

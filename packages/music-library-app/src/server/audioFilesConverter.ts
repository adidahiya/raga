import { createReadStream, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TrackDefinition } from "@adahiya/music-library-tools-lib";
import ffmpeg from "fluent-ffmpeg";

import {
  DEFAULT_AUDIO_SAMPLE_RATE,
  DEFAULT_MP3_BITRATE,
  LOCAL_STORAGE_KEY,
} from "../common/constants";
import { ServerErrors } from "../common/errorMessages";
import { AudioFilesServerOptions } from "./audioFilesServer";
import { log } from "./serverLogger";

export type AudioFilesConverterConfig = AudioFilesServerOptions;

/** Minimal set of properties required to run the converter */
export type AudioFilesConverterTrackDefinition = Pick<
  TrackDefinition,
  "Artist" | "Album" | "Name" | "Track ID" | "Location"
>;

export interface MP3ConversionOptions {
  /** "libmp3lame" is preferred */
  codec: string;

  /** Whether to write to a temp directory or to a permanent one (the input file directory) */
  outputDirKind: "temp" | "permanent";

  /** @default 320 */
  bitrate?: number;

  /** @default 44100 */
  sampleRate?: number;

  /**
   * Force a re-conversion even if the output file already exists on disk.
   *
   * @default false
   */
  force?: boolean;
}

export class AudioFilesConverter {
  private temporaryOutputDir: string;

  /**
   * Map of already-converted files on disk.
   * Keys: track ID.
   * Values: converted MP3 file path.
   */
  private convertedFiles = new Map<string, string>();

  constructor(public config: AudioFilesConverterConfig) {
    // N.B. the `tempy` package is not compatible with Vite for some strange reason, so we
    // create temp directories ourself with built-in Node.js APIs
    const tempDir = join(tmpdir(), LOCAL_STORAGE_KEY, "converted");
    mkdirSync(join(tmpdir(), tempDir), { recursive: true });

    if (!existsSync(tempDir)) {
      throw new Error(ServerErrors.TEMP_DIR_UNAVAILABLE);
    }

    log.debug(`Created temporary folder for audio conversion output ${tempDir}`);
    this.temporaryOutputDir = tempDir;
  }

  /**
   * Converts an audio file input stream to an MP3 file at the specified output path using ffmpeg.
   *
   * NOTE: this requires `ffmpeg` to be installed and available on the system path.
   *
   * TODO: move this the music-library-tools-lib package once we figure out how to export values
   * correctly (currently, only type exports work properly)
   *
   * @returns the output file path on disk, if successful
   * @throws if the output file path could not be created on disk
   */
  public async convertAudioFileToMP3(
    /** Track properties necessary for the conversion, including the input file location on disk */
    trackProperties: AudioFilesConverterTrackDefinition,
    /** MP3 conversion options forwarded to ffmpeg */
    options: MP3ConversionOptions,
  ): Promise<string> {
    const inputFilePath = fileURLToPath(trackProperties.Location);
    const {
      bitrate = DEFAULT_MP3_BITRATE,
      codec,
      // TODO: implement 'force' option
      // force = false,
      outputDirKind,
      sampleRate = DEFAULT_AUDIO_SAMPLE_RATE,
    } = options;

    const inputFileStream = createReadStream(inputFilePath);
    const outputFileName = basename(inputFilePath).replace(extname(inputFilePath), ".mp3");
    const outputFolder =
      outputDirKind === "temp"
        ? this.createTempOutputDirForTrack(trackProperties)
        : dirname(inputFilePath);
    const outputFilePath = join(outputFolder, outputFileName);

    if (existsSync(outputFilePath)) {
      log.info(`MP3 file already exists at ${outputFilePath}, skipping conversion`);
      return Promise.resolve(outputFilePath);
    }

    return new Promise<string>((resolve, reject) => {
      console.time(`audioFileConverter`);
      ffmpeg(inputFileStream)
        .audioCodec(codec)
        .audioBitrate(bitrate)
        .audioFrequency(sampleRate)
        .noVideo()
        .save(outputFilePath)
        .on("end", () => {
          console.timeEnd(`audioFileConverter`);
          log.debug(`Wrote converted MP3 at ${outputFilePath}`);
          resolve(outputFilePath);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }

  public cleanup() {
    throw new Error("Not implemented");
  }

  /** @throws if unable to create output dir */
  private createTempOutputDirForTrack(trackProperties: AudioFilesConverterTrackDefinition): string {
    const outputDir = join(this.temporaryOutputDir, `track-id-${trackProperties["Track ID"]}`);
    mkdirSync(join(this.temporaryOutputDir, `track-id-${trackProperties["Track ID"]}`), {
      recursive: true,
    });
    if (!existsSync(outputDir)) {
      throw new Error(ServerErrors.TEMP_DIR_UNAVAILABLE);
    }
    return outputDir;
  }
}

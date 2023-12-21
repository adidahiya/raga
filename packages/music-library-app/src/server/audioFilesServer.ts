import { createReadStream, existsSync, mkdtempSync, readdirSync, ReadStream } from "node:fs";
import { Server } from "node:http";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { env } from "node:process";

import { App, NextFunction, Request, Response } from "@tinyhttp/app";
import ffmpeg from "fluent-ffmpeg";
import sirv from "sirv";

import { DEFAULT_AUDIO_FILES_SERVER_PORT } from "../common/constants";
import { isSupportedWebAudioFileFormat } from "../common/webAudioUtils";
import { log } from "./serverLogger";

let audioFilesServer: AudioFilesServer | undefined;

export interface AudioFilesServerOptions {
  audioFilesRootFolder: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export interface AudioFilesServer {
  /** @internal */
  _app: App;
  stop: () => void;
}

export async function startAudioFilesServer(
  options: AudioFilesServerOptions,
): Promise<AudioFilesServer> {
  return new Promise((resolve, _reject) => {
    try {
      if (audioFilesServer !== undefined) {
        log.info(`audio files server is already running`);
        options.onReady?.();
        resolve(audioFilesServer);
        return;
      }

      validateRootFolderOrThrow(options.audioFilesRootFolder);

      log.debug(`starting audio files server at ${options.audioFilesRootFolder}...`);
      const app = initServerApp(options);

      waitForServerToStart(app)
        .then((server: Server) => {
          audioFilesServer = {
            _app: app,
            stop: () => {
              server.close();
              audioFilesServer = undefined;
            },
          };
          options.onReady?.();
          resolve(audioFilesServer);
        })
        .catch((e) => {
          options.onError?.(e as Error);
        });
    } catch (e) {
      options.onError?.(e as Error);
    }
  });
}

function initServerApp(options: AudioFilesServerOptions): App {
  const app = new App();

  const staticServerMiddleware = sirv(options.audioFilesRootFolder, {
    dev: env.NODE_ENV === "development",
  });

  const audioFileConverterMiddleware = async (
    { path }: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const inputRelativeFilePath = decodeURIComponent(path);
    const filePath = `${options.audioFilesRootFolder}${inputRelativeFilePath}`;
    if (filePath.includes(".") && !isSupportedWebAudioFileFormat(filePath)) {
      log.debug(`Received request for audio file type unsupported by Web Audio: ${filePath}`);

      const fileExists = existsSync(filePath);
      if (!fileExists) {
        res.status(404).send(`Audio file not found: ${filePath}`);
        return;
      }

      const inputFileStream = createReadStream(filePath);
      const outputFileName = basename(inputRelativeFilePath).replace(
        extname(inputRelativeFilePath),
        ".mp3",
      );

      // TODO: re-use already-converted files if available
      try {
        // N.B. the `tempy` package is not compatible with Vite for some strange reason, so we
        // create temp directories ourself with built-in Node.js APIs
        const outputFolder = mkdtempSync(join(tmpdir(), "music-library-app"));
        log.debug(`Created temporary folder ${outputFolder}`);
        const outputFilePath = join(outputFolder, outputFileName);
        await convertAudioFileToMP3(inputFileStream, outputFilePath);
        res.status(200).sendFile(outputFilePath);
      } catch (e) {
        const err = e as Error;
        log.error(err.message);
        res.status(500).send(err.message);
      }
    } else {
      next();
    }
  };

  function handlePingRequest(_req: Request, res: Response) {
    try {
      validateRootFolderOrThrow(options.audioFilesRootFolder);
    } catch (e) {
      const err = e as Error;
      res.status(500).send(err.message);
    }

    res.status(200).send("pong");
  }

  return app
    .get("/ping", handlePingRequest)
    .use(audioFileConverterMiddleware)
    .use(staticServerMiddleware);
}

async function waitForServerToStart(app: App, timeoutMs = 1_000): Promise<Server> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      log.error(`audio files server failed to start after ${timeoutMs}ms`);
      reject();
    }, timeoutMs);

    let server: Server | undefined = undefined;

    function handleStart() {
      clearTimeout(timeout);
      resolve(server!);
    }

    server = app.listen(DEFAULT_AUDIO_FILES_SERVER_PORT, handleStart);
  });
}

function validateRootFolderOrThrow(rootFolder: string): void {
  const rootFolderExists = existsSync(rootFolder) && readdirSync(rootFolder).length > 0;

  if (!rootFolderExists) {
    throw new Error(`[server] audio files root folder ${rootFolder} does not exist or is empty`);
  }
}

// TODO: move this to a separate module (possibly music-library-tools-lib)
async function convertAudioFileToMP3(inputFileStream: ReadStream, outputFilePath: string) {
  return new Promise<void>((resolve, reject) => {
    console.time(`audioFileConverter`);
    ffmpeg(inputFileStream)
      .audioCodec("libmp3lame")
      .audioBitrate(320)
      .audioFrequency(44100)
      .noVideo()
      .save(outputFilePath)
      .on("end", () => {
        console.timeEnd(`audioFileConverter`);
        log.debug(`Wrote converted MP3 at ${outputFilePath}`);
        resolve();
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

import { existsSync, readdirSync } from "node:fs";
import { Server } from "node:http";
import { env } from "node:process";

import { App, NextFunction, Request, Response } from "@tinyhttp/app";
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

  const audioFileConverterMiddleware = ({ path }: Request, res: Response, next: NextFunction) => {
    const audioFileName = path.split("/").pop()!;
    if (audioFileName.includes(".") && !isSupportedWebAudioFileFormat(audioFileName)) {
      log.debug(`Received request for audio file with unsupported type: ${audioFileName}`);
    }
    next();
  };

  function handlePingRequest(req: Request, res: Response) {
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
    .use(staticServerMiddleware)
    .use(audioFileConverterMiddleware);
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

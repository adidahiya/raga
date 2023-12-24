import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { type Server } from "node:http";
import { env } from "node:process";

import { App, type Request, type Response } from "@tinyhttp/app";
import sirv from "sirv";

import { AudioFilesServerRoutes as ServerRoutes } from "../common/audioFilesServerRoutes";
import { DEFAULT_AUDIO_FILES_SERVER_PORT } from "../common/constants";
import { ServerErrors } from "../common/errorMessages";
import { type AudioFilesServerStartedEventPayload } from "../common/events";
import { AudioFilesConverter } from "./audioFilesConverter";
import { getConvertToMP3RequestHandler } from "./handlers/convertToMP3Handler";
import { log } from "./serverLogger";

let audioFilesServer: AudioFilesServer | undefined;

export interface AudioFilesServerOptions {
  audioFilesRootFolder: string;
  onReady?: (startedInfo: AudioFilesServerStartedEventPayload) => void;
  onError?: (error: Error) => void;
}

export interface AudioFilesServer {
  /** @internal */
  _app: App;
  converter: AudioFilesConverter;
  stop: () => void;
}

export async function startAudioFilesServer(
  options: AudioFilesServerOptions,
): Promise<AudioFilesServer> {
  return new Promise((resolve, _reject) => {
    try {
      if (audioFilesServer !== undefined) {
        log.info(`Audio files server is already running`);
        options.onReady?.({
          audioConverterTemporaryFolder: audioFilesServer.converter.temporaryOutputDir,
        });
        resolve(audioFilesServer);
        return;
      }

      log.debug(`Starting audio files server at ${options.audioFilesRootFolder}...`);
      validateRootFolderOrThrow(options.audioFilesRootFolder);

      log.debug(`Initializing audio files converter...`);
      const converter = new AudioFilesConverter(options);
      const app = initServerApp(converter, options);

      if (app === undefined) {
        log.error(ServerErrors.AUDIO_FILES_SERVER_INIT_FAILED);
        options.onError?.(new Error(ServerErrors.AUDIO_FILES_SERVER_INIT_FAILED));
        return;
      }

      waitForServerToStart(app)
        .then((server: Server) => {
          audioFilesServer = {
            _app: app,
            converter: converter,
            stop: () => {
              server.close();
              audioFilesServer = undefined;
            },
          };
          options.onReady?.({
            audioConverterTemporaryFolder: audioFilesServer.converter.temporaryOutputDir,
          });
          resolve(audioFilesServer);
        })
        .catch((e) => {
          const err = e as Error;
          log.error(err.message);
          options.onError?.(err);
        });
    } catch (e) {
      const err = e as Error;
      log.error(err.message);
      options.onError?.(err);
    }
  });
}

function initServerApp(
  converter: AudioFilesConverter,
  options: AudioFilesServerOptions,
): App | undefined {
  const app = new App();

  const staticServerMiddleware = sirv(options.audioFilesRootFolder, {
    dev: env.NODE_ENV === "development",
  });

  function handlePingRequest(_req: Request, res: Response) {
    try {
      validateRootFolderOrThrow(options.audioFilesRootFolder);
    } catch (e) {
      const err = e as Error;
      res.status(500).send(err.message);
    }

    res.status(200).send("pong");
  }

  function handleGetConvertedMP3FileRequest(req: Request, res: Response) {
    const filepath = decodeURIComponent(req.params.filepath);
    const fileExists = existsSync(filepath);

    if (!fileExists) {
      res.status(404).send(ServerErrors.CONVERTED_AUDIO_FILE_NOT_FOUND);
      return;
    }

    const fileStat = statSync(filepath);
    const fileStream = createReadStream(filepath);
    res.status(200).header({
      "Content-Type": "audio/mpeg",
      "Content-Length": fileStat.size,
    });
    fileStream.pipe(res);
  }

  return app
    .get(ServerRoutes.GET_PING, handlePingRequest)
    .get(`${ServerRoutes.GET_CONVERTED_MP3}/:filepath`, handleGetConvertedMP3FileRequest)
    .post(ServerRoutes.POST_CONVERT_TO_MP3, getConvertToMP3RequestHandler(converter))
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
    throw new Error(ServerErrors.AUDIO_FILES_ROOT_FOLDER_NOT_FOUND);
  }
}

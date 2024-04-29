import { once } from "node:events";
import { existsSync, readdirSync } from "node:fs";
import { type Server } from "node:http";
import { env } from "node:process";

import { AudioFileConverter } from "@adahiya/raga-lib";
import { App, type Request, type Response } from "@tinyhttp/app";
import { call, type Operation, run } from "effection";
import sirv from "sirv";

import { AudioFilesServerRoutes as ServerRoutes } from "../common/api/audioFilesServerAPI";
import { withTimeout } from "../common/asyncUtils";
import { DEFAULT_AUDIO_FILES_SERVER_PORT } from "../common/constants";
import { ServerErrors } from "../common/errorMessages";
import { type AudioFilesServerStartedEventPayload } from "../common/events";
import ffmpeg from "./common/ffmpeg";
import { log } from "./common/serverLogger";
import { getConvertToMP3RequestHandler } from "./handlers/convertToMP3Handler";

let audioFilesServer: AudioFilesServer | undefined;

export interface AudioFilesServerOptions {
  audioFilesRootFolder: string;
  onReady?: (startedInfo: AudioFilesServerStartedEventPayload) => void;
  onError?: (error: Error) => void;
}

export interface AudioFilesServer {
  /** @internal */
  _app: App;
  converter: AudioFileConverter;
  stop: () => void;
}

/**
 * Gracefully starts the audio files server if it's not already running.
 *
 * If there's an error during intialization, it will be logged and the provided `onError`
 * callback will be invoked, but it will not throw.
 */
export function* startAudioFilesServer(
  options: AudioFilesServerOptions,
): Operation<AudioFilesServer | undefined> {
  if (audioFilesServer !== undefined) {
    log.info(`Audio files server is already running`);
    options.onReady?.({
      audioConverterTemporaryFolder: audioFilesServer.converter.temporaryOutputDir,
    });
    return audioFilesServer;
  }

  try {
    const newAudioFilesServer = yield* createAudioFileConverterAndInitServer(options);
    audioFilesServer = newAudioFilesServer;
    return newAudioFilesServer;
  } catch (e) {
    options.onError?.(e as Error);
    log.error((e as Error).message);
    return undefined;
  }
}

/** @throws */
function* createAudioFileConverterAndInitServer(
  options: AudioFilesServerOptions,
): Operation<AudioFilesServer> {
  log.debug(`Starting audio files server at ${options.audioFilesRootFolder}...`);
  validateRootFolderOrThrow(options.audioFilesRootFolder);

  log.debug(`Initializing audio files converter...`);
  const converter = new AudioFileConverter({ ffmpeg });
  const app = initServerApp(converter, options);

  const httpServer = yield* waitForHTTPServerToStart(app);

  const newAudioFilesServer = {
    _app: app,
    converter: converter,
    stop: () => {
      httpServer.close();
      audioFilesServer = undefined;
    },
  };

  options.onReady?.({
    audioConverterTemporaryFolder: newAudioFilesServer.converter.temporaryOutputDir,
  });

  return newAudioFilesServer;
}

function initServerApp(converter: AudioFileConverter, options: AudioFilesServerOptions): App {
  const app = new App();

  const staticServerMiddleware = sirv(options.audioFilesRootFolder, {
    dev: env.NODE_ENV === "development",
  });

  function handlePingRequest(_req: Request, res: Response) {
    try {
      validateRootFolderOrThrow(options.audioFilesRootFolder);
      res.status(200).send("pong");
    } catch (e) {
      res.status(500).send((e as Error).message);
    }
  }

  /**
   * Returns the requested MP3 file from disk, if it exists.
   */
  function handleGetConvertedMP3FileRequest(req: Request, res: Response) {
    const filepath = decodeURIComponent(req.params.filepath);
    const fileExists = existsSync(filepath);

    if (!fileExists) {
      res.status(404).send(ServerErrors.CONVERTED_AUDIO_FILE_NOT_FOUND);
      return;
    }

    res.status(200).sendFile(filepath);
  }

  /**
   * Requests the record of all previously converted MP3 files on disk from the audio file converter.
   */
  function handleGetAllConvertedMP3s(_req: Request, res: Response) {
    const allConvertedMP3s = converter.getAllConvertedMP3s();
    res.status(200).json(allConvertedMP3s);
  }

  return app
    .get(ServerRoutes.GET_PING, handlePingRequest)
    .get(`${ServerRoutes.GET_CONVERTED_MP3}/:filepath`, handleGetConvertedMP3FileRequest)
    .get(ServerRoutes.GET_ALL_CONVERTED_MP3S, handleGetAllConvertedMP3s)
    .post(ServerRoutes.POST_CONVERT_TO_MP3, getConvertToMP3RequestHandler(converter))
    .use(staticServerMiddleware);
}

/** @throws */
function* waitForHTTPServerToStart(app: App, timeoutMs = 1_000): Operation<Server> {
  return yield* withTimeout(
    run(function* () {
      const newServer = app.listen(DEFAULT_AUDIO_FILES_SERVER_PORT);
      yield* call(once(newServer, "listening"));
      return newServer;
    }),
    timeoutMs,
    `Audio files server failed to start after ${timeoutMs.toString()}ms`,
  );
}

function validateRootFolderOrThrow(rootFolder: string): void {
  const rootFolderExists = existsSync(rootFolder) && readdirSync(rootFolder).length > 0;

  if (!rootFolderExists) {
    throw new Error(ServerErrors.AUDIO_FILES_ROOT_FOLDER_NOT_FOUND);
  }
}

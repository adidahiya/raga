import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { type Server } from "node:http";
import { env } from "node:process";

import { AudioFileConverter } from "@adahiya/music-library-tools-lib";
import { App, type Request, type Response } from "@tinyhttp/app";
import { tryit } from "radash";
import sirv from "sirv";

import { AudioFilesServerRoutes as ServerRoutes } from "../common/api/audioFilesServerAPI";
import { DEFAULT_AUDIO_FILES_SERVER_PORT } from "../common/constants";
import { ServerErrors } from "../common/errorMessages";
import { type AudioFilesServerStartedEventPayload } from "../common/events";
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
  converter: AudioFileConverter;
  stop: () => void;
}

/**
 * Gracefully starts the audio files server if it's not already running.
 *
 * If there's an error during intialization, it will be logged and the provided `onError`
 * callback will be invoked, but it will not throw.
 */
export async function startAudioFilesServer(
  options: AudioFilesServerOptions,
): Promise<AudioFilesServer | undefined> {
  if (audioFilesServer !== undefined) {
    log.info(`Audio files server is already running`);
    options.onReady?.({
      audioConverterTemporaryFolder: audioFilesServer.converter.temporaryOutputDir,
    });
    return Promise.resolve(audioFilesServer);
  }

  const [err, newAudioFilesServer] = await tryit(createAudioFileConverterAndInitServer)(options);

  if (err !== undefined) {
    options.onError?.(err);
    log.error(err.message);
    return undefined;
  }

  audioFilesServer = newAudioFilesServer;
  return newAudioFilesServer;
}

/** @throws */
async function createAudioFileConverterAndInitServer(
  options: AudioFilesServerOptions,
): Promise<AudioFilesServer> {
  log.debug(`Starting audio files server at ${options.audioFilesRootFolder}...`);
  validateRootFolderOrThrow(options.audioFilesRootFolder);

  log.debug(`Initializing audio files converter...`);
  const converter = new AudioFileConverter();
  const app = initServerApp(converter, options);

  if (app === undefined) {
    throw new Error(ServerErrors.AUDIO_FILES_SERVER_INIT_FAILED);
  }

  const httpServer = await waitForHTTPServerToStart(app);
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

function initServerApp(
  converter: AudioFileConverter,
  options: AudioFilesServerOptions,
): App | undefined {
  const app = new App();

  const staticServerMiddleware = sirv(options.audioFilesRootFolder, {
    dev: env.NODE_ENV === "development",
  });

  function handlePingRequest(_req: Request, res: Response) {
    const [err] = tryit(validateRootFolderOrThrow)(options.audioFilesRootFolder);
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send("pong");
    }
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

async function waitForHTTPServerToStart(app: App, timeoutMs = 1_000): Promise<Server> {
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

import { writeFileSync } from "node:fs";

import {
  convertSwinsianToItunesXmlLibrary,
  loadSwinsianLibrary,
  type MusicAppLibraryPlist,
  serializeLibraryPlist,
  type SwinsianLibraryPlist,
} from "@adahiya/music-library-tools-lib";
import { serializeError } from "serialize-error";

import {
  type AudioFilesServerStartOptions,
  ClientEventChannel,
  type ClientEventPayloadMap,
  type ClientMessageEvent,
  type LoadedSwinsianLibraryEventPayload,
  type LoadSwinsianLibraryOptions,
  ServerEventChannel,
  type WriteAudioFileTagOptions,
  type WriteModifiedLibraryOptions,
} from "../common/events";
import { type AudioFilesServer, startAudioFilesServer } from "./audioFilesServer";
import { log } from "./serverLogger";
import { writeAudioFileTag } from "./writeAudioFileTag";

let library: SwinsianLibraryPlist | undefined;

export function initAppServer() {
  process.parentPort.on("message", ({ data: event }: ClientMessageEvent) => {
    log.debug(`received '${event.channel}' event`);

    // HACKHACK: need to figure out the right syntax to get conditional inferred types working for event payloads
    switch (event.channel) {
      case ClientEventChannel.LOAD_SWINSIAN_LIBRARY:
        handleLoadSwinsianLibrary(event.data as ClientEventPayloadMap[typeof event.channel]);
        break;
      case ClientEventChannel.WRITE_AUDIO_FILE_TAG:
        handleWriteAudioFileTag(event.data as ClientEventPayloadMap[typeof event.channel]);
        break;
      case ClientEventChannel.AUDIO_FILES_SERVER_START:
        void handleAudioFilesServerStart(event.data as ClientEventPayloadMap[typeof event.channel]);
        break;
      case ClientEventChannel.AUDIO_FILES_SERVER_STOP:
        handleAudioFilesServerStop();
        break;
      case ClientEventChannel.WRITE_MODIFIED_LIBRARY:
        handleWriteModifiedLibrary(event.data as ClientEventPayloadMap[typeof event.channel]);
        break;
      default:
        break;
    }
  });
}

function handleLoadSwinsianLibrary({ filepath, reloadFromDisk }: LoadSwinsianLibraryOptions) {
  if (library === undefined || reloadFromDisk) {
    // HACKHACK
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    library = loadSwinsianLibrary(filepath) as SwinsianLibraryPlist | undefined;
  }

  if (library === undefined) {
    log.error(`Could not load Swinsian library from ${filepath}`);
    return;
  }

  const channel = ServerEventChannel.LOADED_SWINSIAN_LIBRARY;
  const data: LoadedSwinsianLibraryEventPayload = {
    library,
    filepath,
  };
  const response = { channel, data };
  process.parentPort.postMessage(response);
}

function handleWriteAudioFileTag(options: WriteAudioFileTagOptions) {
  writeAudioFileTag(options);
  log.debug(`Wrote ${options.tagName}: ${options.value} tag to ${options.fileLocation}`);
  process.parentPort.postMessage({
    channel: ServerEventChannel.WRITE_AUDIO_FILE_TAG_COMPLETE,
  });
}

let audioFilesServer: AudioFilesServer | undefined;

async function handleAudioFilesServerStart(options: AudioFilesServerStartOptions) {
  audioFilesServer = await startAudioFilesServer({
    ...options,
    onReady: (startedInfo) => {
      process.parentPort.postMessage({
        channel: ServerEventChannel.AUDIO_FILES_SERVER_STARTED,
        data: startedInfo,
      });
    },
    onError: (error) => {
      process.parentPort.postMessage({
        channel: ServerEventChannel.AUDIO_FILES_SERVER_ERROR,
        data: serializeError(error),
      });
    },
  });
}

function handleAudioFilesServerStop() {
  if (audioFilesServer === undefined) {
    log.error("Received request to stop audio files server, but it is not running");
    return;
  }

  audioFilesServer.stop();
  process.parentPort.postMessage({
    channel: ServerEventChannel.AUDIO_FILES_SERVER_READY_FOR_RESTART,
  });
}

/**
 * Writes the modified library to disk, both the Swinsian XML and Music.app XML formats.
 * The former is used when running this app again, and the latter is used when continuing a music management
 * workflow in Rekordbox.
 */
function handleWriteModifiedLibrary(options: WriteModifiedLibraryOptions) {
  options.library.Date = new Date();
  const serializedSwinsianLibrary = serializeLibraryPlist(options.library);
  const convertedLibrary = convertSwinsianToItunesXmlLibrary(
    options.library,
  ) as MusicAppLibraryPlist;
  const serializedMusicAppLibrary = serializeLibraryPlist(convertedLibrary);

  const swinsianLibraryOutputPath = options.inputFilepath;
  const modifiedLibraryOutputPath = options.outputFilepath;

  log.debug(`Overwriting Swinsian library at ${swinsianLibraryOutputPath}...`);
  log.debug(`Writing modified library to ${modifiedLibraryOutputPath}...`);

  writeFileSync(swinsianLibraryOutputPath, serializedSwinsianLibrary);
  writeFileSync(modifiedLibraryOutputPath, serializedMusicAppLibrary);

  process.parentPort.postMessage({
    channel: ServerEventChannel.WRITE_MODIFIED_LIBRARY_COMPLETE,
  });

  log.debug(`...done!`);
}

import { writeFileSync } from "node:fs";

import {
  convertSwinsianToItunesXmlLibrary,
  loadSwinsianLibrary,
  serializeLibraryPlist,
  type SwinsianLibraryPlist,
} from "@adahiya/raga-lib";
import { type Operation, run } from "effection";
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
import { log } from "./common/serverLogger";
import { computeLibraryMetadata } from "./libraryMeta/computeLibraryMetadata";
import { writeAudioFileTag } from "./writeAudioFileTag";

let library: SwinsianLibraryPlist | undefined;

export function initAppServer() {
  // N.B. this event handler must be a regular function, not an Operation, to ensure that it is run
  // and not simply defined as a generator function
  process.parentPort.on("message", function ({ data: event }: ClientMessageEvent) {
    log.debug(`received '${event.channel}' event`);

    // HACKHACK: need to figure out the right syntax to get conditional inferred types working for event payloads
    switch (event.channel) {
      case ClientEventChannel.APP_SERVER_PING:
        process.parentPort.postMessage({ channel: ServerEventChannel.APP_SERVER_READY });
        break;
      case ClientEventChannel.LOAD_SWINSIAN_LIBRARY:
        handleLoadSwinsianLibrary(event.data as ClientEventPayloadMap[typeof event.channel]);
        break;
      case ClientEventChannel.WRITE_AUDIO_FILE_TAG:
        handleWriteAudioFileTag(event.data as ClientEventPayloadMap[typeof event.channel]);
        break;
      case ClientEventChannel.AUDIO_FILES_SERVER_START:
        void run(function* () {
          yield* handleAudioFilesServerStart(
            event.data as ClientEventPayloadMap[typeof event.channel],
          );
        });
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
    try {
      log.debug(`Loading Swinsian library from ${filepath}...`);
      library = loadSwinsianLibrary(filepath);
    } catch {
      log.error(`Could not load Swinsian library from ${filepath}`);
      return;
    }
  }

  process.parentPort.postMessage({
    channel: ServerEventChannel.LOADED_SWINSIAN_LIBRARY,
    data: {
      library,
      libraryMeta: computeLibraryMetadata(library),
      filepath,
    } satisfies LoadedSwinsianLibraryEventPayload,
  });
}

function handleWriteAudioFileTag(options: WriteAudioFileTagOptions) {
  writeAudioFileTag(options);
  log.debug(
    `Wrote ${options.tagName}: ${options.value?.toString() ?? "undefined"} tag to ${options.fileLocation}`,
  );
  process.parentPort.postMessage({
    channel: ServerEventChannel.WRITE_AUDIO_FILE_TAG_COMPLETE,
  });
}

let audioFilesServer: AudioFilesServer | undefined;

function* handleAudioFilesServerStart(options: AudioFilesServerStartOptions): Operation<void> {
  audioFilesServer = yield* startAudioFilesServer({
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
  const serializedMusicAppLibrary = convertSwinsianToItunesXmlLibrary(
    options.library,
    options.selectedPlaylistIds,
  );

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

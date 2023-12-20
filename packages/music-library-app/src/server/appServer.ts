// HACKHACK: regular imports are not working here, for some reason
import type { MusicAppLibraryPlist, SwinsianLibraryPlist } from "@adahiya/music-library-tools-lib";
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const {
    convertSwinsianToItunesXmlLibrary,
    loadSwinsianLibrary,
    serializeLibraryPlist,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("@adahiya/music-library-tools-lib");

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import NodeID3 from "node-id3";

import {
    AudioFilesServerStartOptions,
    ClientEventChannel,
    ClientEventPayloadMap,
    ClientMessageEvent,
    LoadedSwinsianLibraryEventPayload,
    LoadSwinsianLibraryOptions,
    ServerEventChannel,
    WriteAudioFileTagOptions,
    WriteModifiedLibraryOptions,
} from "../common/events";
import { AudioFilesServer, startAudioFilesServer } from "./audioFilesServer";
import { log } from "./serverLogger";

let library: SwinsianLibraryPlist | undefined;

export function initAppServer() {
    process.parentPort.on("message", ({ data: event }: ClientMessageEvent) => {
        log.debug(`received '${event.channel}' event`);

        // HACKHACK: need to figure out the right syntax to get conditional inferred types working for event payloads
        switch (event.channel) {
            case ClientEventChannel.LOAD_SWINSIAN_LIBRARY:
                handleLoadSwinsianLibrary(
                    event.data as ClientEventPayloadMap[typeof event.channel],
                );
                break;
            case ClientEventChannel.WRITE_AUDIO_FILE_TAG:
                handleWriteAudioFileTag(event.data as ClientEventPayloadMap[typeof event.channel]);
                break;
            case ClientEventChannel.AUDIO_FILES_SERVER_START:
                void handleAudioFilesServerStart(
                    event.data as ClientEventPayloadMap[typeof event.channel],
                );
                break;
            case ClientEventChannel.AUDIO_FILES_SERVER_STOP:
                handleAudioFilesServerStop();
                break;
            case ClientEventChannel.WRITE_MODIFIED_LIBRARY:
                handleWriteModifiedLibrary(
                    event.data as ClientEventPayloadMap[typeof event.channel],
                );
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
    const filepath = fileURLToPath(options.fileLocation);
    // TODO: better type for tags record
    const newTags: Record<string, string> = {};

    switch (options.tagName) {
        case "BPM":
            newTags.TBPM = options.value.toString();
            break;
        default:
            break;
    }

    const result = NodeID3.update(newTags, filepath);
    if (result === true) {
        log.debug(
            `Wrote tags for file located at ${options.fileLocation}: ${JSON.stringify(newTags)}`,
        );
        process.parentPort.postMessage({
            channel: ServerEventChannel.WRITE_AUDIO_FILE_TAG_COMPLETE,
        });
    } else {
        throw new Error(result.message);
    }
}

let audioFilesServer: AudioFilesServer | undefined;

async function handleAudioFilesServerStart(options: AudioFilesServerStartOptions) {
    try {
        await startAudioFilesServer({
            ...options,
            onReady: () => {
                process.parentPort.postMessage({
                    channel: ServerEventChannel.AUDIO_FILES_SERVER_STARTED,
                });
            },
            onError: (error) => {
                process.parentPort.postMessage({
                    channel: ServerEventChannel.AUDIO_FILES_SERVER_ERROR,
                    data: error,
                });
            },
        });
    } catch (e) {
        log.error((e as Error).message);
    }
}

function handleAudioFilesServerStop() {
    if (audioFilesServer === undefined) {
        log.info("Received request to stop audio files server, but it is not running");
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
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    const serializedSwinsianLibrary = serializeLibraryPlist(options.library) as string;
    const convertedLibrary = convertSwinsianToItunesXmlLibrary(
        options.library,
    ) as MusicAppLibraryPlist;
    const serializedMusicAppLibrary = serializeLibraryPlist(convertedLibrary) as string;
    /* eslint-enable @typescript-eslint/no-unsafe-call */

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

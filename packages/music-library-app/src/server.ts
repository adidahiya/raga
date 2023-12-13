// HACKHACK: regular imports are not working here, for some reason
import type { SwinsianLibraryPlist } from "@adahiya/music-library-tools-lib";
const {
    convertSwinsianToItunesXmlLibrary,
    getDefaultSwinsianExportFolder,
    getSwinsianLibraryPath,
    getOutputLibraryPath,
    loadSwinsianLibrary,
    serializeLibraryPlist,
} = require("@adahiya/music-library-tools-lib");

import type { MessageEvent } from "electron";
import NodeID3 from "node-id3";
import { fileURLToPath } from "node:url";
import { ChildProcessWithoutNullStreams } from "node:child_process";

import {
    ClientEventChannel,
    LoadSwinsianLibraryOptions,
    LoadedSwinsianLibraryEventPayload,
    ServerEventChannel,
    WriteModifiedLibraryOptions,
} from "./events";
import { DEBUG } from "./common/constants";
import { startAudioFilesServer } from "./audio/audioFilesServer";
import { writeFileSync } from "node:fs";

let library: SwinsianLibraryPlist | undefined;

function handleLoadSwinsianLibrary(options: LoadSwinsianLibraryOptions = {}) {
    const filepath = getSwinsianLibraryPath(getDefaultSwinsianExportFolder());

    if (library === undefined || options.reloadFromDisk) {
        library = loadSwinsianLibrary(filepath);
    }

    if (library === undefined) {
        console.error(`[server] Could not load Swinsian library from ${filepath}`);
        return;
    }

    const channel = ServerEventChannel.LOADED_SWINSIAN_LIBRARY;
    const data: LoadedSwinsianLibraryEventPayload = {
        library,
        filepath,
    };
    const response = { channel, data };
    if (DEBUG) {
        console.log(`[server] sending "${channel}" message`, response);
    }
    process.parentPort.postMessage(response);
}

type SupportedTagName = "BPM";

function handleWriteAudioFileTag(options: {
    fileLocation: string;
    tagName: SupportedTagName;
    value: string | number;
}) {
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
        if (DEBUG) {
            console.info(
                `[server] Wrote tags for file located at ${options.fileLocation}:`,
                newTags,
            );
        }
        process.parentPort.postMessage({
            channel: ServerEventChannel.WRITE_AUDIO_FILE_TAG_COMPLETE,
        });
    } else {
        throw new Error(result.message);
    }
}

// TODO: convert to Node HTTP server
let audioFilesServer: ChildProcessWithoutNullStreams | undefined;

async function handleAudioFilesServerStart(options: { audioFilesRootFolder: string }) {
    audioFilesServer = await startAudioFilesServer(options.audioFilesRootFolder);

    process.parentPort.postMessage({
        channel: ServerEventChannel.AUDIO_FILES_SERVER_STARTED,
    });

    audioFilesServer.on("error", (err) => {
        process.parentPort.postMessage({
            channel: ServerEventChannel.AUDIO_FILES_SERVER_ERROR,
            data: err,
        });
    });

    audioFilesServer.on("exit", () => {
        process.parentPort.postMessage({
            channel: ServerEventChannel.AUDIO_FILES_SERVER_READY_FOR_RESTART,
        });
    });
}

function handleAudioFilesServerStop() {
    if (audioFilesServer === undefined) {
        console.info("[server] Received request to stop audio files server, but it is not running");
        return;
    }

    audioFilesServer.kill();
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
    const convertedLibrary = convertSwinsianToItunesXmlLibrary(options.library);
    const serializedMusicAppLibrary = serializeLibraryPlist(convertedLibrary);

    const swinsianLibraryOutputPath = options.filepath;
    const modifiedLibraryOutputPath = getOutputLibraryPath();

    if (DEBUG) {
        console.log(`[server] Overwriting Swinsian library at ${swinsianLibraryOutputPath}...`);
        console.log(`[server] Writing modified library to ${modifiedLibraryOutputPath}...`);
    }

    writeFileSync(swinsianLibraryOutputPath, serializedSwinsianLibrary);
    writeFileSync(modifiedLibraryOutputPath, serializedMusicAppLibrary);

    process.parentPort.postMessage({
        channel: ServerEventChannel.WRITE_MODIFIED_LIBRARY_COMPLETE,
    });

    if (DEBUG) {
        console.log(`[server] ... done!`);
    }
}

function setupEventListeners() {
    process.parentPort.on("message", ({ data: event }: MessageEvent) => {
        if (DEBUG) {
            console.log(`[server] received "${event.channel}" event`, event);
        }

        switch (event.channel) {
            case ClientEventChannel.LOAD_SWINSIAN_LIBRARY:
                handleLoadSwinsianLibrary(event.data);
                break;
            case ClientEventChannel.WRITE_AUDIO_FILE_TAG:
                handleWriteAudioFileTag(event.data);
                break;
            case ClientEventChannel.AUDIO_FILES_SERVER_START:
                handleAudioFilesServerStart(event.data);
                break;
            case ClientEventChannel.AUDIO_FILES_SERVER_STOP:
                handleAudioFilesServerStop();
                break;
            case ClientEventChannel.WRITE_MODIFIED_LIBRARY:
                handleWriteModifiedLibrary(event.data);
                break;
            default:
                break;
        }
    });
}

if (DEBUG) {
    console.log("[server] loaded utility process");
}
setupEventListeners();

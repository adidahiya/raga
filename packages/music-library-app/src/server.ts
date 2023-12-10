// HACKHACK: regular imports are not working here, for some reason
// import {
//     DEFAULT_SWINSIAN_EXPORT_FOLDER,
//     getSwinsianLibraryPath,
//     loadSwinsianLibrary,
// } from "@adahiya/music-library-tools-lib";
import type { MusicLibraryPlist } from "@adahiya/music-library-tools-lib";
const {
    DEFAULT_SWINSIAN_EXPORT_FOLDER,
    getSwinsianLibraryPath,
    loadSwinsianLibrary,
} = require("@adahiya/music-library-tools-lib");

import type { MessageEvent } from "electron";
import NodeID3 from "node-id3";
import { fileURLToPath } from "node:url";
import { ChildProcessWithoutNullStreams } from "node:child_process";

import {
    ClientEventChannel,
    LoadedSwinsianLibraryEventPayload,
    ServerEventChannel,
} from "./events";
import { DEBUG } from "./common/constants";
import { startAudioFilesServer } from "./audio/audioFilesServer";

let library: MusicLibraryPlist | undefined;

function handleLoadSwinsianLibrary(options?: { reloadFromDisk?: boolean }) {
    const filepath = getSwinsianLibraryPath(DEFAULT_SWINSIAN_EXPORT_FOLDER);

    if (library === undefined || options?.reloadFromDisk) {
        // HACKHACK: type cast
        library = loadSwinsianLibrary(filepath) as MusicLibraryPlist;
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

    if (DEBUG) {
        console.info(`[server] Writing tags for file located at ${options.fileLocation}:`, newTags);
    }

    NodeID3.update(newTags, filepath, (err: Error | undefined) => {
        if (err != null) {
            throw new Error(err.message);
        }
    });
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

function setupEventListeners() {
    process.parentPort.on("message", ({ data: event }: MessageEvent) => {
        if (DEBUG) {
            console.log(`[server] received "${event.channel}" event`, event);
        }

        if (event.channel === ClientEventChannel.LOAD_SWINSIAN_LIBRARY) {
            handleLoadSwinsianLibrary(event.data);
        } else if (event.channel === ClientEventChannel.WRITE_AUDIO_FILE_TAG) {
            handleWriteAudioFileTag(event.data);
        } else if (event.channel === ClientEventChannel.AUDIO_FILES_SERVER_START) {
            handleAudioFilesServerStart(event.data);
        } else if (event.channel === ClientEventChannel.AUDIO_FILES_SERVER_STOP) {
            handleAudioFilesServerStop();
        }
    });
}

process.on("loaded", () => {
    if (DEBUG) {
        console.log("[server] loaded utility process");
    }
    setupEventListeners();
});

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
import {
    ClientEventChannel,
    LoadedSwinsianLibraryEventPayload,
    ServerEventChannel,
} from "./events";
import { DEBUG } from "./common/constants";

let library: MusicLibraryPlist | undefined;

function handleLoadSwinsianLibrary(options: any) {
    const filepath = getSwinsianLibraryPath(DEFAULT_SWINSIAN_EXPORT_FOLDER);

    if (library === undefined || options.reloadFromDisk) {
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

function setupEventListeners() {
    process.parentPort.on("message", ({ data: event }: MessageEvent) => {
        if (DEBUG) {
            console.log(`[server] received "${event.channel}" event`, event);
        }

        if (event.channel === ClientEventChannel.LOAD_SWINSIAN_LIBRARY) {
            handleLoadSwinsianLibrary(event);
        }
    });
}

process.on("loaded", () => {
    if (DEBUG) {
        console.log("[server] loaded utility process");
    }
    setupEventListeners();
});

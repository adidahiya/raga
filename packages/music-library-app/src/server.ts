// HACKHACK: regular imports are not working here, for some reason
// import {
//     DEFAULT_SWINSIAN_EXPORT_FOLDER,
//     getSwinsianLibraryPath,
//     loadSwinsianLibrary,
// } from "@adahiya/music-library-tools-lib";
const {
    DEFAULT_SWINSIAN_EXPORT_FOLDER,
    getSwinsianLibraryPath,
    loadSwinsianLibrary,
} = require("@adahiya/music-library-tools-lib");

import type { MessageEvent } from "electron";
import { ClientEventChannel, ServerEventChannel } from "./events";
import { DEBUG } from "./common/constants";
import { MusicLibraryPlist } from "@adahiya/music-library-tools-lib";

let library: MusicLibraryPlist | undefined;

if (DEBUG) {
    console.log("[server] starting utility process");
}

function handleLoadSwinsianLibrary(_event: MessageEvent) {
    if (library === undefined) {
        library = loadSwinsianLibrary(getSwinsianLibraryPath(DEFAULT_SWINSIAN_EXPORT_FOLDER));
    }

    const channel = ServerEventChannel.LOADED_SWINSIAN_LIBRARY;
    const response = {
        channel,
        data: { library },
    };
    if (DEBUG) {
        console.log(`[server] sending "${channel}" message`, response);
    }
    process.parentPort.postMessage(response);
}

function setupEventListeners() {
    process.parentPort.on("message", (event: MessageEvent) => {
        if (DEBUG) {
            console.log(`[server] received "${event.data.channel}" event`, event);
        }

        if (event.data.channel === ClientEventChannel.LOAD_SWINSIAN_LIBRARY) {
            handleLoadSwinsianLibrary(event);
        }
    });
}

process.on("loaded", () => {
    if (DEBUG) {
        console.log("[server] setting up IPC event listeners");
    }
    setupEventListeners();
});

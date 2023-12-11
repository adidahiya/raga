import type { SwinsianLibraryPlist } from "@adahiya/music-library-tools-lib";

// Event channels

export const ClientEventChannel = {
    AUDIO_FILES_SERVER_START: "audioFilesServerStart" as const,
    AUDIO_FILES_SERVER_STOP: "audioFilesServerStop" as const,
    LOAD_SWINSIAN_LIBRARY: "loadSwinsianLibrary" as const,
    WRITE_AUDIO_FILE_TAG: "writeAudioFileTag" as const,
};
export type ClientEventChannel = (typeof ClientEventChannel)[keyof typeof ClientEventChannel];

export function isClientEventChannel(channel: string): channel is ClientEventChannel {
    return Object.values(ClientEventChannel).includes(channel as ClientEventChannel);
}

export const ServerEventChannel = {
    AUDIO_FILES_SERVER_ERROR: "audioFilesServerError" as const,
    AUDIO_FILES_SERVER_STARTED: "audioFilesServerStarted" as const,
    AUDIO_FILES_SERVER_READY_FOR_RESTART: "audioFilesServerReadyForRestart" as const,
    LOADED_SWINSIAN_LIBRARY: "loadedSwinsianLibrary" as "loadedSwinsianLibrary",
    WRITE_AUDIO_FILE_TAG_COMPLETE: "writeAudioFileTagComplete" as const,
};
export type ServerEventChannel = (typeof ServerEventChannel)[keyof typeof ServerEventChannel];

export function isServerEventChannel(channel: string): channel is ServerEventChannel {
    return Object.values(ServerEventChannel).includes(channel as ServerEventChannel);
}

// Event payloads
export interface LoadedSwinsianLibraryEventPayload {
    /** Library XML plist */
    library: SwinsianLibraryPlist;

    /** Location of library XML on disk */
    filepath: string;
}

export interface LoadSwinsianLibraryOptions {
    reloadFromDisk?: boolean;
}

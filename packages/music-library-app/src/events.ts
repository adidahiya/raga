import type { MusicLibraryPlist } from "@adahiya/music-library-tools-lib";

// Event channels

export const ClientEventChannel = {
    LOAD_SWINSIAN_LIBRARY: "loadSwinsianLibrary" as "loadSwinsianLibrary",
};
export type ClientEventChannel = (typeof ClientEventChannel)[keyof typeof ClientEventChannel];

export function isClientEventChannel(channel: string): channel is ClientEventChannel {
    return Object.values(ClientEventChannel).includes(channel as ClientEventChannel);
}

export const ServerEventChannel = {
    LOADED_SWINSIAN_LIBRARY: "loadedSwinsianLibrary" as "loadedSwinsianLibrary",
};
export type ServerEventChannel = (typeof ServerEventChannel)[keyof typeof ServerEventChannel];

export function isServerEventChannel(channel: string): channel is ServerEventChannel {
    return Object.values(ServerEventChannel).includes(channel as ServerEventChannel);
}

// Event payloads
export interface LoadedSwinsianLibraryEventPayload {
    /** Library XML plist */
    library: MusicLibraryPlist;

    /** Location of library XML on disk */
    filepath: string;
}

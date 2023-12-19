import type { SwinsianLibraryPlist } from "@adahiya/music-library-tools-lib";
import type { MessageEvent } from "electron";

// Event channels

export const ClientEventChannel = {
    AUDIO_FILES_SERVER_START: "audioFilesServerStart" as const,
    AUDIO_FILES_SERVER_STOP: "audioFilesServerStop" as const,
    LOAD_SWINSIAN_LIBRARY: "loadSwinsianLibrary" as const,
    WRITE_AUDIO_FILE_TAG: "writeAudioFileTag" as const,
    WRITE_MODIFIED_LIBRARY: "writeModifiedLibrary" as const,
};
export type ClientEventChannel = (typeof ClientEventChannel)[keyof typeof ClientEventChannel];

export function isClientEventChannel(channel: string): channel is ClientEventChannel {
    return Object.values(ClientEventChannel).includes(channel as ClientEventChannel);
}

export const ServerEventChannel = {
    AUDIO_FILES_SERVER_ERROR: "audioFilesServerError" as const,
    AUDIO_FILES_SERVER_STARTED: "audioFilesServerStarted" as const,
    AUDIO_FILES_SERVER_READY_FOR_RESTART: "audioFilesServerReadyForRestart" as const,
    LOADED_SWINSIAN_LIBRARY: "loadedSwinsianLibrary" as const,
    WRITE_AUDIO_FILE_TAG_COMPLETE: "writeAudioFileTagComplete" as const,
    WRITE_MODIFIED_LIBRARY_COMPLETE: "writeModifiedLibraryComplete" as const,
};
export type ServerEventChannel = (typeof ServerEventChannel)[keyof typeof ServerEventChannel];

export function isServerEventChannel(channel: string): channel is ServerEventChannel {
    return Object.values(ServerEventChannel).includes(channel as ServerEventChannel);
}

// Event payloads

export interface ClientMessageEvent<C extends ClientEventChannel = ClientEventChannel>
    extends MessageEvent {
    data: {
        channel: C;
        data: ClientEventPayloadMap[C];
    };
}

export interface ClientEventPayloadMap {
    [ClientEventChannel.AUDIO_FILES_SERVER_START]: AudioFilesServerStartOptions;
    [ClientEventChannel.LOAD_SWINSIAN_LIBRARY]: LoadSwinsianLibraryOptions;
    [ClientEventChannel.WRITE_AUDIO_FILE_TAG]: WriteAudioFileTagOptions;
    [ClientEventChannel.WRITE_MODIFIED_LIBRARY]: WriteModifiedLibraryOptions;
    [ClientEventChannel.AUDIO_FILES_SERVER_STOP]: never;
}

export interface LoadedSwinsianLibraryEventPayload {
    /** Library XML plist */
    library: SwinsianLibraryPlist;

    /** Location of library XML on disk */
    filepath: string;
}

export interface LoadSwinsianLibraryOptions {
    filepath: string;
    reloadFromDisk?: boolean;
}

export interface AudioFilesServerStartOptions {
    audioFilesRootFolder: string;
}

type SupportedTagName = "BPM";

export interface WriteAudioFileTagOptions {
    fileLocation: string;
    tagName: SupportedTagName;
    value: string | number;
}

export interface WriteModifiedLibraryOptions {
    /** Modified Swinsian library */
    library: SwinsianLibraryPlist;

    /** Location of the original Swinsian library XML on disk (to be overwritten) */
    filepath: string;
}

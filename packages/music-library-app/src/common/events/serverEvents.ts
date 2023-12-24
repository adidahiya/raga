import type { SwinsianLibraryPlist } from "@adahiya/music-library-tools-lib";

// Event channels

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

export interface ServerEventPayloadMap {
  [ServerEventChannel.AUDIO_FILES_SERVER_ERROR]: Error;
  [ServerEventChannel.AUDIO_FILES_SERVER_STARTED]: AudioFilesServerStartedEventPayload;
  [ServerEventChannel.AUDIO_FILES_SERVER_READY_FOR_RESTART]: never;
  [ServerEventChannel.LOADED_SWINSIAN_LIBRARY]: LoadedSwinsianLibraryEventPayload;
  [ServerEventChannel.WRITE_AUDIO_FILE_TAG_COMPLETE]: never;
  [ServerEventChannel.WRITE_MODIFIED_LIBRARY_COMPLETE]: never;
}

export interface AudioFilesServerStartedEventPayload {
  audioConverterTemporaryFolder: string;
}

export interface LoadedSwinsianLibraryEventPayload {
  /** Library XML plist */
  library: SwinsianLibraryPlist;

  /** Location of library XML on disk */
  filepath: string;
}

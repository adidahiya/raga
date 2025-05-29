import type { SwinsianLibraryPlist } from "@adahiya/raga-lib";

import type { LibraryMetadata } from "../../server/libraryMeta/computeLibraryMetadata";

// Event channels

export const ServerEventChannel = {
  APP_SERVER_READY: "appServerReady" as const,
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
  [ServerEventChannel.APP_SERVER_READY]: never;
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

  /** Library metadata, computed by raga-app */
  libraryMeta: LibraryMetadata;

  /** Location of library XML on disk */
  filepath: string;
}

import type { SwinsianLibraryPlist } from "@adahiya/raga-lib";
import type { MessageEvent } from "electron";

// Event channels

export const ClientEventChannel = {
  APP_SERVER_PING: "appServerPing" as const,
  AUDIO_FILES_SERVER_START: "audioFilesServerStart" as const,
  AUDIO_FILES_SERVER_STOP: "audioFilesServerStop" as const,
  LOAD_SWINSIAN_LIBRARY: "loadSwinsianLibrary" as const,
  OPEN_FILE_LOCATION: "openFileLocation" as const,
  WRITE_AUDIO_FILE_TAG: "writeAudioFileTag" as const,
  WRITE_MODIFIED_LIBRARY: "writeModifiedLibrary" as const,
};
export type ClientEventChannel = (typeof ClientEventChannel)[keyof typeof ClientEventChannel];

export function isClientEventChannel(channel: string): channel is ClientEventChannel {
  return Object.values(ClientEventChannel).includes(channel as ClientEventChannel);
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
  [ClientEventChannel.APP_SERVER_PING]: never;
  [ClientEventChannel.AUDIO_FILES_SERVER_START]: AudioFilesServerStartOptions;
  [ClientEventChannel.LOAD_SWINSIAN_LIBRARY]: LoadSwinsianLibraryOptions;
  [ClientEventChannel.OPEN_FILE_LOCATION]: OpenFileLocationOptions;
  [ClientEventChannel.WRITE_AUDIO_FILE_TAG]: WriteAudioFileTagOptions;
  [ClientEventChannel.WRITE_MODIFIED_LIBRARY]: WriteModifiedLibraryOptions;
  [ClientEventChannel.AUDIO_FILES_SERVER_STOP]: never;
}

export interface LoadSwinsianLibraryOptions {
  filepath: string;
  reloadFromDisk?: boolean;
}

export interface AudioFilesServerStartOptions {
  audioFilesRootFolder: string;
}

export type SupportedTagName = "BPM" | "Rating" | "Title" | "Artist" | "Album" | "Genre";

export interface WriteAudioFileTagOptions {
  fileLocation: string;
  tagName: SupportedTagName;
  userEmail: string | undefined;
  value: string | number | undefined;
}

export interface WriteModifiedLibraryOptions {
  /** Modified Swinsian library */
  library: SwinsianLibraryPlist;

  /** Location of the original Swinsian library XML on disk (to be overwritten) */
  inputFilepath: string;

  /**
   * Location of the new modified library (compatible with Music.app & Rekordbox) to be written to disk, usually
   * adjacent to the input library file.
   */
  outputFilepath: string;
}

export interface OpenFileLocationOptions {
  filepath: string;
}

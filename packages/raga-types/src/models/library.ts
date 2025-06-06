import type { PlaylistDefinition } from "./playlists.js";
import type {
  BasicTrackDefinition,
  MusicAppTrackDefinition,
  SwinsianTrackDefinition,
} from "./tracks.js";

export interface MusicLibraryPlist {
  "Application Version": string;
  Date: Date;
  Features: number;
  "Library Persistent ID": string;
  "Major Version": number;
  "Minor Version": number;
  "Music Folder": string;
  Playlists: PlaylistDefinition[];
  "Show Content Ratings": boolean;
  Tracks: Record<number, BasicTrackDefinition>;
}

export interface SwinsianLibraryPlist extends MusicLibraryPlist {
  Tracks: Record<number, SwinsianTrackDefinition>;
}

export interface MusicAppLibraryPlist extends MusicLibraryPlist {
  Tracks: Record<number, MusicAppTrackDefinition>;
}

export interface LibraryMetadata {
  totalTracks: number;
  totalPlaylists: number;
  lastModified: string;
  longestCommonAudioFilePath: string;
}

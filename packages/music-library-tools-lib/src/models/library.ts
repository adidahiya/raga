import {
    BasicTrackDefinition,
    MusicAppTrackDefinition,
    SwinsianTrackDefinition,
} from "./tracks.js";
import { PlaylistDefinition } from "./playlists.js";

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

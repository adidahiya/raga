import { BasicTrackDefinition } from "../models/tracks.mjs";
import { PlaylistDefinition } from "../models/playlists.mjs";

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

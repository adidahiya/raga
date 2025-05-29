// Stub for server-specific library metadata types
// In the web app, this would be computed on a backend server

export interface LibraryMetadata {
  totalTracks: number;
  totalPlaylists: number;
  totalDuration: number;
  lastModified: string;
  longestCommonAudioFilePath: string;
}

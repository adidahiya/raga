export interface PlaylistDefinition {
  "All Items"?: boolean;
  Description?: string;
  Master?: boolean;
  Name: string;
  "Parent Persistent ID"?: string;
  "Playlist ID": string;
  "Playlist Items": { "Track ID": number }[];
  "Playlist Persistent ID": string;
  Visible?: boolean;
}

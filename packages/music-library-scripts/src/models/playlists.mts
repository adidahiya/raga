export interface PlaylistDefinition {
    "All Items"?: boolean;
    Description?: string;
    Master?: boolean;
    Name: string;
    "Playlist ID": string;
    "Playlist Items": Array<{ "Track ID": number }>;
    "Playlist Persistent ID": string;
    Visible?: boolean;
}

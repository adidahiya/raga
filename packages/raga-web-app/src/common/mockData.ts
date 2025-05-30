import type {
  PlaylistDefinition,
  SwinsianLibraryPlist,
  SwinsianTrackDefinition,
} from "@adahiya/raga-lib";

// Generate a random string ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Generate a random date within the last year
const generateRandomDate = () => {
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const randomDate = new Date(
    oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime()),
  );
  // HACKHACK: weird type assertion
  return randomDate as Date & number;
};

// Generate a mock track
const generateMockTrack = (id: number): SwinsianTrackDefinition => {
  const genres = ["House", "Techno", "Deep House", "Progressive House", "Tech House", "Minimal"];
  const artists = ["Artist A", "Artist B", "Artist C", "Artist D", "Artist E"];
  const albums = ["Album X", "Album Y", "Album Z", "Compilation 1", "Compilation 2"];

  return {
    "Track ID": id,
    "Persistent ID": generateId(),
    Name: `Track ${id.toString()}`,
    Artist: artists[Math.floor(Math.random() * artists.length)],
    Album: albums[Math.floor(Math.random() * albums.length)],
    Genre: genres[Math.floor(Math.random() * genres.length)],
    BPM: Math.floor(Math.random() * 40) + 120, // Random BPM between 120-160
    Rating: Math.floor(Math.random() * 5), // Random rating 0-4
    "Date Added": generateRandomDate(),
    Location: `/Users/music/Track${id.toString()}.mp3`,
    "Track Type": "File",
    Size: Math.floor(Math.random() * 10000000) + 1000000, // Random size between 1-11MB
    "Total Time": Math.floor(Math.random() * 300000) + 180000, // Random duration between 3-8 minutes
    "Bit Rate": 320,
    "Sample Rate": 44100,
    "Play Count": Math.floor(Math.random() * 100),
    "Date Modified": generateRandomDate(),
    "Track Number": Math.floor(Math.random() * 20) + 1,
    Year: Math.floor(Math.random() * 30) + 1990,
    "Volume Adjustment": 0,
    "Album Artist": artists[Math.floor(Math.random() * artists.length)],
  };
};

// Generate mock playlists
const generateMockPlaylists = (numTracks: number): PlaylistDefinition[] => {
  const playlists: PlaylistDefinition[] = [
    {
      Name: "Library",
      "Playlist ID": "1",
      "Playlist Persistent ID": generateId(),
      "All Items": true,
      Master: true,
      "Playlist Items": Array.from({ length: numTracks }, (_, i) => ({ "Track ID": i + 1 })),
    },
    {
      Name: "Recently Added",
      "Playlist ID": "2",
      "Playlist Persistent ID": generateId(),
      "Playlist Items": Array.from({ length: 20 }, (_, i) => ({ "Track ID": i + 1 })),
    },
    {
      Name: "House",
      "Playlist ID": "3",
      "Playlist Persistent ID": generateId(),
      "Playlist Items": Array.from({ length: 15 }, (_, i) => ({ "Track ID": i + 1 })),
    },
    {
      Name: "Techno",
      "Playlist ID": "4",
      "Playlist Persistent ID": generateId(),
      "Playlist Items": Array.from({ length: 15 }, (_, i) => ({ "Track ID": i + 16 })),
    },
    {
      Name: "Deep House",
      "Playlist ID": "5",
      "Playlist Persistent ID": generateId(),
      "Playlist Items": Array.from({ length: 15 }, (_, i) => ({ "Track ID": i + 31 })),
    },
  ];

  return playlists;
};

// Generate a complete mock library
export const generateMockLibrary = (): SwinsianLibraryPlist => {
  const numTracks = 50;
  const tracks: Record<number, SwinsianTrackDefinition> = {};

  // Generate tracks
  for (let i = 1; i <= numTracks; i++) {
    tracks[i] = generateMockTrack(i);
  }

  return {
    "Application Version": "1.0.0",
    Date: new Date(),
    Features: 5,
    "Library Persistent ID": generateId(),
    "Major Version": 1,
    "Minor Version": 0,
    "Music Folder": "/Users/music",
    Playlists: generateMockPlaylists(numTracks),
    "Show Content Ratings": true,
    Tracks: tracks,
  };
};

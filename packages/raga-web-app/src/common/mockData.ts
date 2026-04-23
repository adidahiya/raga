import {
  AUDIO_FEATURE_CACHE_VERSION,
  type AudioFeatureCache,
  type CamelotKey,
  type PlaylistDefinition,
  type SwinsianLibraryPlist,
  type SwinsianTrackDefinition,
  type TrackAudioFeatures,
} from "@adahiya/raga-types";
import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";

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
  const genres = [
    "House",
    "Techno",
    "Deep House",
    "Progressive House",
    "Tech House",
    "Minimal",
    "Melodic Techno",
    "Afro House",
    "Organic House",
    "Downtempo",
  ];

  const artist = faker.person.fullName();
  const album = faker.music.songName();
  const genre = faker.helpers.arrayElement(genres);
  const year = faker.number.int({ min: 1990, max: 2024 });
  const bpm = faker.number.int({ min: 120, max: 160 });
  const rating = faker.number.int({ min: 0, max: 4 });
  const playCount = faker.number.int({ min: 0, max: 1000 });
  const trackNumber = faker.number.int({ min: 1, max: 20 });
  const totalTime = faker.number.int({ min: 180000, max: 480000 }); // 3-8 minutes
  const size = faker.number.int({ min: 1000000, max: 11000000 }); // 1-11MB

  return {
    "Track ID": id,
    "Persistent ID": uuid(),
    Name: faker.music.songName(),
    Artist: artist,
    Album: album,
    Genre: genre,
    BPM: bpm,
    Rating: rating,
    "Date Added": generateRandomDate(),
    Location: `/Users/music/${artist.replace(/\s+/g, "_")}/${album.replace(/\s+/g, "_")}/${faker.system.fileName({ extensionCount: 0 })}.mp3`,
    "Track Type": "File",
    Size: size,
    "Total Time": totalTime,
    "Bit Rate": 320,
    "Sample Rate": 44100,
    "Play Count": playCount,
    "Date Modified": generateRandomDate(),
    "Track Number": trackNumber,
    Year: year,
    "Volume Adjustment": 0,
    "Album Artist": artist,
  };
};

// Generate mock playlists
const generateMockPlaylists = (numTracks: number): PlaylistDefinition[] => {
  const playlists: PlaylistDefinition[] = [
    {
      Name: "Library",
      "Playlist ID": "1",
      "Playlist Persistent ID": uuid(),
      "All Items": true,
      Master: true,
      "Playlist Items": Array.from({ length: numTracks }, (_, i) => ({ "Track ID": i + 1 })),
    },
    {
      Name: "Recently Added",
      "Playlist ID": "2",
      "Playlist Persistent ID": uuid(),
      "Playlist Items": Array.from({ length: 20 }, (_, i) => ({ "Track ID": i + 1 })),
    },
    {
      Name: "House",
      "Playlist ID": "3",
      "Playlist Persistent ID": uuid(),
      "Playlist Items": Array.from({ length: 15 }, (_, i) => ({ "Track ID": i + 1 })),
    },
    {
      Name: "Techno",
      "Playlist ID": "4",
      "Playlist Persistent ID": uuid(),
      "Playlist Items": Array.from({ length: 15 }, (_, i) => ({ "Track ID": i + 16 })),
    },
    {
      Name: "Deep House",
      "Playlist ID": "5",
      "Playlist Persistent ID": uuid(),
      "Playlist Items": Array.from({ length: 15 }, (_, i) => ({ "Track ID": i + 31 })),
    },
  ];

  // Add some random playlists
  const randomPlaylistCount = faker.number.int({ min: 3, max: 7 });
  for (let i = 0; i < randomPlaylistCount; i++) {
    const playlistName = faker.music.genre();
    const trackCount = faker.number.int({ min: 10, max: 30 });
    const startTrackId = faker.number.int({ min: 1, max: numTracks - trackCount });

    playlists.push({
      Name: playlistName,
      "Playlist ID": (playlists.length + 1).toString(),
      "Playlist Persistent ID": uuid(),
      "Playlist Items": Array.from({ length: trackCount }, (_, i) => ({
        "Track ID": startTrackId + i,
      })),
    });
  }

  return playlists;
};

// Generate a complete mock library
export const generateMockLibrary = (): SwinsianLibraryPlist => {
  const numTracks = faker.number.int({ min: 50, max: 100 });
  const tracks: Record<number, SwinsianTrackDefinition> = {};

  // Generate tracks
  for (let i = 1; i <= numTracks; i++) {
    tracks[i] = generateMockTrack(i);
  }

  return {
    "Application Version": "1.0.0",
    Date: new Date(),
    Features: 5,
    "Library Persistent ID": uuid(),
    "Major Version": 1,
    "Minor Version": 0,
    "Music Folder": "/Users/music",
    Playlists: generateMockPlaylists(numTracks),
    "Show Content Ratings": true,
    Tracks: tracks,
  };
};

const CAMELOT_KEYS: CamelotKey[] = [
  "1A","1B","2A","2B","3A","3B","4A","4B","5A","5B","6A","6B",
  "7A","7B","8A","8B","9A","9B","10A","10B","11A","11B","12A","12B",
];

/** Generate a deterministic-ish feature vector from track metadata for mock mode. */
function mockFeatureVectorForTrack(track: SwinsianTrackDefinition): TrackAudioFeatures {
  const bpm = track.BPM ?? faker.number.int({ min: 90, max: 160 });
  const energy = Math.min(1, Math.max(0, ((track.BPM ?? 120) - 90) / 80));
  const key = faker.helpers.arrayElement(CAMELOT_KEYS);
  const tonicAngle = ((CAMELOT_KEYS.indexOf(key) % 12) / 12) * 2 * Math.PI;
  const vector = [
    Math.min(1, (bpm - 60) / 140),
    energy,
    Math.sin(tonicAngle),
    Math.cos(tonicAngle),
    key.endsWith("B") ? 1 : 0,
    faker.number.float({ min: 0, max: 1 }),
    faker.number.float({ min: 0, max: 1 }),
    faker.number.float({ min: 0, max: 1 }),
  ];
  return {
    bpm,
    key,
    energy,
    vector,
    version: AUDIO_FEATURE_CACHE_VERSION,
    extractedAt: Date.now(),
  };
}

/** Generate a mock audio feature cache covering every track in the library. */
export function generateMockAudioFeatureCache(library: SwinsianLibraryPlist): AudioFeatureCache {
  const tracks: Record<string, TrackAudioFeatures> = {};
  for (const t of Object.values(library.Tracks)) {
    tracks[t["Persistent ID"]] = mockFeatureVectorForTrack(t);
  }
  return {
    version: AUDIO_FEATURE_CACHE_VERSION,
    libraryPersistentId: library["Library Persistent ID"],
    tracks,
  };
}

/**
 * Generate a larger atlas-sized mock library: ~300 albums, each with 4-12 tracks. Useful for
 * exercising layout, atlas slice, and quadtree at realistic scale.
 */
export function generateMockAtlasLibrary(numAlbums = 300): SwinsianLibraryPlist {
  const tracks: Record<number, SwinsianTrackDefinition> = {};
  let trackId = 1;
  for (let a = 0; a < numAlbums; a++) {
    const albumArtist = faker.person.fullName();
    const albumName = faker.music.album();
    const genre = faker.music.genre();
    const year = faker.number.int({ min: 1970, max: 2024 });
    const trackCount = faker.number.int({ min: 4, max: 12 });
    for (let n = 1; n <= trackCount; n++) {
      const bpm = faker.number.int({ min: 80, max: 170 });
      tracks[trackId] = {
        "Track ID": trackId,
        "Persistent ID": uuid(),
        Name: faker.music.songName(),
        Artist: albumArtist,
        "Album Artist": albumArtist,
        Album: albumName,
        Genre: genre,
        BPM: bpm,
        Rating: faker.number.int({ min: 0, max: 4 }),
        "Date Added": generateRandomDate(),
        Location: `/Users/music/${albumArtist.replace(/\s+/g, "_")}/${albumName.replace(/\s+/g, "_")}/${n.toString()}.mp3`,
        "Track Type": "File",
        Size: faker.number.int({ min: 1_000_000, max: 11_000_000 }),
        "Total Time": faker.number.int({ min: 180_000, max: 480_000 }),
        "Bit Rate": 320,
        "Sample Rate": 44_100,
        "Play Count": faker.number.int({ min: 0, max: 1_000 }),
        "Date Modified": generateRandomDate(),
        "Track Number": n,
        Year: year,
        "Volume Adjustment": 0,
      };
      trackId++;
    }
  }

  const numTracks = trackId - 1;
  return {
    "Application Version": "1.0.0",
    Date: new Date(),
    Features: 5,
    "Library Persistent ID": uuid(),
    "Major Version": 1,
    "Minor Version": 0,
    "Music Folder": "/Users/music",
    Playlists: generateMockPlaylists(numTracks),
    "Show Content Ratings": true,
    Tracks: tracks,
  };
}

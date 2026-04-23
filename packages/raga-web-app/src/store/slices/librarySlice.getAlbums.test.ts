import {
  AUDIO_FEATURE_CACHE_VERSION,
  type AudioFeatureCache,
  type SwinsianLibraryPlist,
  type SwinsianTrackDefinition,
} from "@adahiya/raga-types";
import { describe, expect, it, vi } from "vitest";

import type { AppStore } from "../appStore";
import type { AppStoreGet, AppStoreSet } from "../zustandUtils";
import { createLibrarySlice } from "./librarySlice";

function track(id: number, overrides: Partial<SwinsianTrackDefinition> = {}): SwinsianTrackDefinition {
  return {
    "Track ID": id,
    "Persistent ID": `pid-${id.toString()}`,
    Location: `file:///t/${id.toString()}.mp3`,
    Album: "Test Album",
    "Album Artist": "Test Artist",
    Artist: "Test Artist",
    Genre: "House",
    Year: 2020,
    "Total Time": 200_000,
    "Play Count": 5,
    BPM: 120,
    ...overrides,
  };
}

function mkLibrary(tracks: SwinsianTrackDefinition[]): SwinsianLibraryPlist {
  const Tracks: Record<number, SwinsianTrackDefinition> = {};
  for (const t of tracks) Tracks[t["Track ID"]] = t;
  return {
    "Application Version": "x",
    Date: new Date(),
    Features: 0,
    "Library Persistent ID": "lib",
    "Major Version": 1,
    "Minor Version": 0,
    "Music Folder": "/m",
    Playlists: [],
    "Show Content Ratings": false,
    Tracks,
  };
}

function makeSlice(library: SwinsianLibraryPlist | undefined, audioFeatureCache: AudioFeatureCache) {
  const fakeGet = vi.fn(() => ({ library, audioFeatureCache })) as unknown as AppStoreGet;
  const fakeSet = vi.fn() as unknown as AppStoreSet;
  const fakeApi = {} as unknown as Parameters<typeof createLibrarySlice>[2];
  return createLibrarySlice(fakeSet, fakeGet, fakeApi) as Pick<AppStore, "getAlbums">;
}

describe("librarySlice.getAlbums", () => {
  it("threads the in-memory audio feature cache into the album rollup", () => {
    const cache: AudioFeatureCache = {
      version: AUDIO_FEATURE_CACHE_VERSION,
      libraryPersistentId: "lib",
      tracks: {
        "pid-1": {
          bpm: 100,
          energy: 0.4,
          key: "8B",
          vector: [],
          version: AUDIO_FEATURE_CACHE_VERSION,
          extractedAt: 0,
        },
        "pid-2": {
          bpm: 130,
          energy: 0.8,
          key: "8B",
          vector: [],
          version: AUDIO_FEATURE_CACHE_VERSION,
          extractedAt: 0,
        },
      },
    };
    const library = mkLibrary([track(1, { BPM: undefined }), track(2, { BPM: undefined })]);
    const slice = makeSlice(library, cache);
    const albums = slice.getAlbums();
    expect(albums).toHaveLength(1);
    expect(albums![0].meanEnergy).toBeCloseTo(0.6);
    expect(albums![0].meanBPM).toBe(115);
  });

  it("returns undefined meanEnergy when the cache has no matching entries", () => {
    const cache: AudioFeatureCache = {
      version: AUDIO_FEATURE_CACHE_VERSION,
      libraryPersistentId: "lib",
      tracks: {},
    };
    const slice = makeSlice(mkLibrary([track(1)]), cache);
    const albums = slice.getAlbums();
    expect(albums![0].meanEnergy).toBeUndefined();
    expect(albums![0].meanBPM).toBe(120);
  });

  it("returns undefined when no library is loaded", () => {
    const slice = makeSlice(undefined, {
      version: AUDIO_FEATURE_CACHE_VERSION,
      libraryPersistentId: "lib",
      tracks: {},
    });
    expect(slice.getAlbums()).toBeUndefined();
  });
});

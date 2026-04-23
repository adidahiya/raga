import type { SwinsianLibraryPlist, SwinsianTrackDefinition } from "@adahiya/raga-types";
import { describe, expect, it } from "vitest";

import { aggregateAlbums, computeAlbumPersistentId } from "./albums";

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

function library(tracks: SwinsianTrackDefinition[]): SwinsianLibraryPlist {
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

describe("aggregateAlbums", () => {
  it("groups tracks by album artist + album name", () => {
    const albums = aggregateAlbums(
      library([
        track(1, { Album: "A", "Album Artist": "X" }),
        track(2, { Album: "A", "Album Artist": "X" }),
        track(3, { Album: "B", "Album Artist": "Y" }),
      ]),
    );
    expect(albums).toHaveLength(2);
    const a = albums.find((al) => al.name === "A")!;
    expect(a.trackCount).toBe(2);
    expect(a.trackIds).toEqual([1, 2]);
  });

  it("falls back to artist when album artist is missing", () => {
    const albums = aggregateAlbums(
      library([track(1, { Album: "A", "Album Artist": undefined, Artist: "Z" })]),
    );
    expect(albums[0].albumArtist).toBe("Z");
  });

  it("aggregates totals and dominant genre", () => {
    const albums = aggregateAlbums(
      library([
        track(1, { Genre: "House", "Total Time": 100, "Play Count": 1, Year: 2020 }),
        track(2, { Genre: "House", "Total Time": 200, "Play Count": 4, Year: 2022 }),
        track(3, { Genre: "Techno", "Total Time": 50, "Play Count": 2, Year: 2021 }),
      ]),
    );
    expect(albums[0].totalTimeMs).toBe(350);
    expect(albums[0].totalPlayCount).toBe(7);
    expect(albums[0].dominantGenre).toBe("House");
    expect(albums[0].yearMin).toBe(2020);
    expect(albums[0].yearMax).toBe(2022);
    expect(albums[0].meanBPM).toBe(120);
  });

  it("computes a stable persistent id", () => {
    expect(computeAlbumPersistentId("Aphex Twin", "Selected Ambient Works")).toBe(
      "album:aphex-twin/selected-ambient-works",
    );
    expect(computeAlbumPersistentId("APHEX TWIN!", "Selected Ambient Works")).toBe(
      computeAlbumPersistentId("Aphex Twin", "Selected Ambient Works"),
    );
  });

  it("incorporates audio features into mean energy/bpm", () => {
    const albums = aggregateAlbums(
      library([track(1, { BPM: undefined }), track(2, { BPM: undefined })]),
      {
        audioFeatures: {
          "pid-1": {
            bpm: 100,
            energy: 0.4,
            key: "8B",
            vector: [],
            version: 1,
            extractedAt: 0,
          },
          "pid-2": {
            bpm: 130,
            energy: 0.8,
            key: "8B",
            vector: [],
            version: 1,
            extractedAt: 0,
          },
        },
      },
    );
    expect(albums[0].meanBPM).toBe(115);
    expect(albums[0].meanEnergy).toBeCloseTo(0.6);
  });
});

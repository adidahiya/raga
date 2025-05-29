import assert from "node:assert";
import { describe, test } from "node:test";

import type { SwinsianLibraryPlist, SwinsianTrackDefinition } from "../index.js";
import convertSwinsianToItunesXmlLibrary from "./index.js";

void describe("convertSwinsianToItunesXmlLibrary", () => {
  const mockLibrary: SwinsianLibraryPlist = {
    "Application Version": "1.0",
    Date: new Date(),
    Features: 5,
    "Library Persistent ID": "test-lib-id",
    "Major Version": 1,
    "Minor Version": 0,
    "Music Folder": "/path/to/music",
    "Show Content Ratings": true,
    Tracks: {
      1: {
        "Track ID": 1,
        "Persistent ID": "test-persistent-id",
        Name: "Test Track",
        Artist: "Test Artist",
        "Total Time": 180000,
        "Play Count": 5,
        "Date Added": new Date("2024-01-01"),
        Location: "file:///path/to/track.mp3",
      } as SwinsianTrackDefinition,
    },
    Playlists: [
      {
        "Playlist ID": "1",
        "Playlist Persistent ID": "playlist-id-1",
        Name: "Playlist 1",
        "Playlist Items": [{ "Track ID": 1 }],
      },
      {
        "Playlist ID": "2",
        "Playlist Persistent ID": "playlist-id-2",
        Name: "Playlist 2",
        "Playlist Items": [{ "Track ID": 1 }],
      },
    ],
  };

  void test("should convert library without filtering when no selectedPlaylistIds provided", () => {
    const result = convertSwinsianToItunesXmlLibrary(mockLibrary);

    assert.strictEqual(result.Playlists.length, 2);
    assert.strictEqual(result.Playlists[0].Name, "Playlist 1");
    assert.strictEqual(result.Playlists[1].Name, "Playlist 2");
  });

  void test("should filter playlists when selectedPlaylistIds provided", () => {
    const result = convertSwinsianToItunesXmlLibrary(mockLibrary, ["playlist-id-1"]);

    assert.strictEqual(result.Playlists.length, 1);
    assert.strictEqual(result.Playlists[0].Name, "Playlist 1");
    assert.strictEqual(result.Playlists[0]["Playlist Persistent ID"], "playlist-id-1");
  });

  void test("should handle empty selectedPlaylistIds array", () => {
    const result = convertSwinsianToItunesXmlLibrary(mockLibrary, []);

    // Should not filter when empty array is provided
    assert.strictEqual(result.Playlists.length, 2);
  });

  void test("should handle non-matching selectedPlaylistIds", () => {
    const result = convertSwinsianToItunesXmlLibrary(mockLibrary, ["non-existent-id"]);

    assert.strictEqual(result.Playlists.length, 0);
  });

  void test("should handle library with no Playlists property", () => {
    const libraryWithoutPlaylists = { ...mockLibrary };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    delete (libraryWithoutPlaylists as any).Playlists;

    const result = convertSwinsianToItunesXmlLibrary(libraryWithoutPlaylists, ["playlist-id-1"]);

    assert.strictEqual(Array.isArray(result.Playlists), true);
    assert.strictEqual(result.Playlists.length, 0);
  });

  void test("should handle library with null Playlists property", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const libraryWithNullPlaylists = { ...mockLibrary, Playlists: null as any };

    const result = convertSwinsianToItunesXmlLibrary(libraryWithNullPlaylists, ["playlist-id-1"]);

    assert.strictEqual(Array.isArray(result.Playlists), true);
    assert.strictEqual(result.Playlists.length, 0);
  });

  void test("should handle library with non-array Playlists property", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const libraryWithInvalidPlaylists = { ...mockLibrary, Playlists: "invalid" as any };

    const result = convertSwinsianToItunesXmlLibrary(libraryWithInvalidPlaylists, [
      "playlist-id-1",
    ]);

    assert.strictEqual(Array.isArray(result.Playlists), true);
    assert.strictEqual(result.Playlists.length, 0);
  });

  void test("should convert tracks properly", () => {
    const result = convertSwinsianToItunesXmlLibrary(mockLibrary);

    assert.strictEqual(typeof result.Tracks[1], "object");
    assert.strictEqual(result.Tracks[1]["Track ID"], 1);
    // Persistent ID gets converted from string to hex format
    assert.strictEqual(typeof result.Tracks[1]["Persistent ID"], "string");
    assert.strictEqual(result.Tracks[1]["Persistent ID"].length, 16);
  });
});

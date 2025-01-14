import * as native from "@adahiya/raga-lib-native";

import type { SwinsianLibraryPlist } from "../models/library.js";
import { convertSwinsianTrackToMusicAppTrack } from "../models/tracks.js";
import { log } from "../utils/log.js";

export function convertSwinsianToItunesXmlLibrary(
  swinsianLibrary: SwinsianLibraryPlist,
  selectedPlaylistIds?: string[],
): string {
  const tracks = Object.values(swinsianLibrary.Tracks).map((track) =>
    convertSwinsianTrackToMusicAppTrack(track),
  );

  let playlists = swinsianLibrary.Playlists;
  if (selectedPlaylistIds) {
    // Optionally filter playlists to only include those that have been selected for export
    log.info(
      `Filtering playlists to only include ${selectedPlaylistIds.length.toString()} playlists`,
    );
    playlists = playlists.filter((playlist) =>
      selectedPlaylistIds.includes(playlist["Playlist Persistent ID"]),
    );
  }

  return native.convertSwinsianToItunesXml(tracks, playlists);
}

export { default as loadSwinsianLibrary } from "./loadSwinsianLibrary.js";
export { default as serializeLibraryPlist } from "./serializeLibraryPlist.js";

import { extname } from "node:path";

import type {
  MusicAppLibraryPlist,
  MusicAppTrackDefinition,
  MusicLibraryPlist,
  SwinsianLibraryPlist,
  SwinsianTrackDefinition,
} from "@adahiya/raga-types";

import { log } from "../utils/log.js";
import { forEachTrackInLibrary } from "./visitDefinitions.js";

export { default as loadSwinsianLibrary } from "./loadSwinsianLibrary.js";
export { default as serializeLibraryPlist } from "./serializeLibraryPlist.js";

export default function (
  swinsianLibrary: SwinsianLibraryPlist,
  selectedPlaylistIds?: string[],
): MusicLibraryPlist {
  const musicAppLibrary = { ...swinsianLibrary } as MusicAppLibraryPlist;

  forEachTrackInLibrary(swinsianLibrary, (track) => {
    const newTrackDefinition = convertSwinsianTrackToMusicAppTrack(
      track as SwinsianTrackDefinition,
    );
    musicAppLibrary.Tracks[track["Track ID"]] = newTrackDefinition;
  });

  if (selectedPlaylistIds && selectedPlaylistIds.length > 0) {
    log.info(
      `Filtering playlists to only include ${selectedPlaylistIds.length.toString()} playlists`,
    );

    if (!Array.isArray(musicAppLibrary.Playlists)) {
      log.warn("No playlists found in library or Playlists is not an array");
      musicAppLibrary.Playlists = [];
    } else {
      // Optionally filter playlists to only include those that have been selected for export
      musicAppLibrary.Playlists = musicAppLibrary.Playlists.filter((playlist) =>
        selectedPlaylistIds.includes(playlist["Playlist Persistent ID"]),
      );
    }
  }

  return musicAppLibrary;
}

export function convertSwinsianTrackToMusicAppTrack(
  track: SwinsianTrackDefinition,
): MusicAppTrackDefinition {
  const extension = extname(track.Location);
  let kind = "MPEG";
  switch (extension) {
    case ".aif":
    case ".aiff":
      kind = "AIFF";
      break;
    case ".flac":
      kind = "FLAC";
      break;
    case ".wav":
      kind = "WAV";
      break;
  }
  return {
    ...track,
    "Artwork Count": 1,
    "File Folder Count": -1,
    "Library Folder Count": -1,
    Kind: `${kind} audio file`,
    Normalization: 0,
    "Persistent ID": parseInt(track["Persistent ID"], 10).toString(16).padStart(16, "0"),
    Loved: false,
  };
}

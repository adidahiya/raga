import {
  type MusicAppLibraryPlist,
  type MusicLibraryPlist,
  type SwinsianLibraryPlist,
} from "../index.js";
import {
  convertSwinsianTrackToMusicAppTrack,
  type SwinsianTrackDefinition,
} from "../models/tracks.js";
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

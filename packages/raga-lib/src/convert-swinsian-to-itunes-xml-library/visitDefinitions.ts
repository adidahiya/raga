import { type MusicLibraryPlist } from "../models/library.js";
import { type PlaylistDefinition } from "../models/playlists.js";
import { type BasicTrackDefinition } from "../models/tracks.js";

type TrackDefinitionVisitor = (track: BasicTrackDefinition) => void;

export function forEachTrackInLibrary(library: MusicLibraryPlist, visitor: TrackDefinitionVisitor) {
  for (const trackId of Object.keys(library.Tracks)) {
    const trackDefinition = library.Tracks[trackId as unknown as number];
    visitor(trackDefinition);
  }
}

type PlaylistDefinitionVisitor = (playlist: PlaylistDefinition) => void;

export function forEachPlaylistInLibrary(
  library: MusicLibraryPlist,
  visitor: PlaylistDefinitionVisitor,
) {
  for (const playlist of library.Playlists) {
    if (playlist.Visible === false || playlist.Master === true) {
      return;
    }
    visitor(playlist);
  }
}

import { forEachTrackInLibrary } from "./visitDefinitions.js";
import { convertSwinsianTrackToMusicAppTrack, SwinsianTrackDefinition } from "../models/tracks.js";
import { MusicAppLibraryPlist, MusicLibraryPlist, SwinsianLibraryPlist } from "../index.js";

export { default as loadSwinsianLibrary } from "./loadSwinsianLibrary.js";
export { default as serializeLibraryPlist } from "./serializeLibraryPlist.js";

export default function (swinsianLibrary: SwinsianLibraryPlist): MusicLibraryPlist {
    const musicAppLibrary = { ...swinsianLibrary } as MusicAppLibraryPlist;

    forEachTrackInLibrary(swinsianLibrary, (track) => {
        const newTrackDefinition = convertSwinsianTrackToMusicAppTrack(
            track as SwinsianTrackDefinition,
        );
        musicAppLibrary.Tracks[track["Track ID"]] = newTrackDefinition;
    });

    return musicAppLibrary;
}

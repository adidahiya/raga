/**
 * @fileoverview CODE SCRATCHPAD
 *
 * Some code snippets from in-progress work which attempted to build a modified library starting
 * from the Music.app library and pulling in new information from Swinsian.
 */

import dedent from "dedent";
import { writeFileSync } from "node:fs";
import { extname, join } from "node:path";

import {
    forEachPlaylistInLibrary,
    forEachTrackInLibrary,
} from "../plist-parser/visitDefinitions.mjs";
import {
    convertSwinsianTrackToMusicAppTrack,
    EDITABLE_TAGS,
    MusicAppTrackDefinition,
    SwinsianTrackDefinition,
} from "../tracks.mjs";
import { loadPlistFile, buildPlistOutput, MusicLibraryPlist } from "../plist-parser/plist.mjs";
import {
    DATA_FOLDER_PATH,
    MUSIC_LIBRARY_PATH,
    OUTPUT_LIBRARY_PATH,
    SWINSIAN_LIBRARY_PATH,
    WRITE_INTERMEDIATE_DATA,
} from "../consts.mjs";
import { reEncodeHtmlEntities } from "../xmlUtils.mjs";

export default function () {
    const swinsianLibrary = loadPlistFile(SWINSIAN_LIBRARY_PATH);
    const musicLibrary = loadPlistFile(MUSIC_LIBRARY_PATH);
    const swinsianTrackIdToMusicAppTrackId: Record<number, number> = {};
    // const tracksOnlyInSwinsianLibrary: SwinsianTrackDefinition[] = [];

    // // tracks keyed by their file location (since track ID and persistent track ID is not consistent between apps)
    const musicAppTracksByLocation: Record<string, MusicAppTrackDefinition> = {};
    forEachTrackInLibrary(musicLibrary, (track) => {
        musicAppTracksByLocation[track.Location] = track as MusicAppTrackDefinition;
    });
    const swinsianTracksByLocation: Record<string, SwinsianTrackDefinition> = {};
    forEachTrackInLibrary(swinsianLibrary, (track) => {
        const swinsianTrack = track as SwinsianTrackDefinition;
        // swinsianTracksByLocation[track.Location] = swinsianTrack;
        const musicAppTrack = musicAppTracksByLocation[track.Location];

        if (musicAppTrack === undefined) {
            // add track which is only present in Swinsian library
            // tracksOnlyInSwinsianLibrary.push(track as SwinsianTrackDefinition);
            musicAppTracksByLocation[track.Location] =
                convertSwinsianTrackToMusicAppTrack(swinsianTrack);
        } else {
            // update track metadata from Swinsian
            for (const tag of EDITABLE_TAGS) {
                // update metadata from Swinsian if necessary
                if (swinsianTrack[tag] !== undefined) {
                    // @ts-ignore -- HACKHACK
                    musicAppTracksByLocation[track.Location][tag] = swinsianTrack[tag];
                }
            }

            swinsianTrackIdToMusicAppTrackId[track["Track ID"]] = musicAppTrack["Track ID"];
        }
    });

    if (WRITE_INTERMEDIATE_DATA) {
        writeFileSync(
            join(DATA_FOLDER_PATH, "tracks-from-music-app.json"),
            JSON.stringify(musicAppTracksByLocation, undefined, 2),
        );
    }

    // re-hydrate Music.app library tracks with the updates we just from Swinsian
    const updatedTracks: MusicLibraryPlist["Tracks"] = {};
    for (const track of Object.values(musicAppTracksByLocation)) {
        // delete the properties we don't need
        // delete (track as Partial<MusicAppTrackDefinition>).Loved;
        updatedTracks[track["Track ID"]] = track;
    }
    musicLibrary.Tracks = updatedTracks;

    // let numTracksFoundInMusicApp = 0;
    // let numTracksNotPresentInMusicApp = 0;
    // forEachTrackInLibrary(swinsianLibrary, (track) => {
    //     const editableTrack = track as MusicAppTrackDefinition;

    //     // Step 0. check which of these tracks we can query for info from Music.app library
    //     const trackDefinitionFromMusicApp = musicAppTracksByLocation[track.Location];
    //     if (trackDefinitionFromMusicApp === undefined) {
    //         numTracksNotPresentInMusicApp++;
    //     } else {
    //         numTracksFoundInMusicApp++;
    //     }

    //     // Step 1. insert Persistent ID from Music.app
    //     const persistentIdFromMusicApp: string | undefined =
    //         trackDefinitionFromMusicApp?.["Persistent ID"];
    //     const persistentIdAsHexString = parseInt(track["Persistent ID"], 10)
    //         .toString(16)
    //         .padStart(16, "0");
    //     editableTrack["Persistent ID"] = persistentIdFromMusicApp ?? persistentIdAsHexString;

    //     // Step 2. insert Kind as "string" property by looking at file name
    //     const extension = extname(track.Location);
    //     let kind = "MPEG";
    //     switch (extension) {
    //         case ".aif":
    //         case ".aiff":
    //             kind = "AIFF";
    //             break;
    //         case ".flac":
    //             kind = "FLAC";
    //             break;
    //         case ".wav":
    //             kind = "WAV";
    //             break;
    //     }
    //     editableTrack.Kind = `${kind} audio file`;

    //     // Step 3. insert File Folder Count and Library Folder Count from Music.app (use -1 if not found)
    //     editableTrack["File Folder Count"] =
    //         trackDefinitionFromMusicApp?.["File Folder Count"] ?? -1;
    //     editableTrack["Library Folder Count"] =
    //         trackDefinitionFromMusicApp?.["Library Folder Count"] ?? -1;
    // });

    // console.info(dedent`
    //     Updated Swinsian track definitions to include Music.app properties.
    //     Found ${numTracksFoundInMusicApp} tracks in Music.app library,
    //     but had to generate info for ${numTracksNotPresentInMusicApp} remaining tracks.
    // `);

    // if (WRITE_INTERMEDIATE_DATA) {
    //     console.info(`Writing modified library as JSON`);
    //     writeFileSync(
    //         join(DATA_FOLDER_PATH, "swinsian-modified-library.json"),
    //         JSON.stringify(swinsianLibrary, undefined, 2),
    //     );
    // }

    console.info(`Building modified library`);
    // let outputPlist = buildPlistOutput(swinsianLibrary);
    let outputPlist = buildPlistOutput(swinsianLibrary);
    outputPlist = reEncodeHtmlEntities(outputPlist);

    console.info(`Writing modified library to ${OUTPUT_LIBRARY_PATH}`);
    writeFileSync(OUTPUT_LIBRARY_PATH, outputPlist);
}

import dedent from "dedent";
import { writeFileSync } from "node:fs";
import { extname, join } from "node:path";

import { forEachTrackInLibrary } from "./forEachTrack.mjs";
import { MusicAppTrackProperty } from "../tracks.mjs";
import { buildXmlOutput, injectDoctypeIntoXmlString, loadXmlFile } from "./xml.mjs";
import {
    collapsePropertiesIntoSingleLine,
    reEncodeHtmlEntities,
    replaceUnpairedTagsWithSelfClosingTags,
} from "../xmlUtils.mjs";
import {
    DATA_FOLDER_PATH,
    MUSIC_LIBRARY_PATH,
    OUTPUT_LIBRARY_PATH,
    SWINSIAN_LIBRARY_PATH,
    WRITE_INTERMEDIATE_DATA,
} from "../consts.mjs";

export default function () {
    const swinsianLibrary = loadXmlFile(SWINSIAN_LIBRARY_PATH);
    const musicLibrary = loadXmlFile(MUSIC_LIBRARY_PATH);

    /**
     * Tracks keyed by their file location (since track ID and persistent track ID is not consistent between apps).
     * We accumulate this map by iterating through the parsed Music.app XML library.
     */
    const musicAppTracksByLocation: Record<string, Record<MusicAppTrackProperty, any>> = {};
    forEachTrackInLibrary(musicLibrary, (track) => {
        musicAppTracksByLocation[track["Location"]] = track as Record<MusicAppTrackProperty, any>;
    });

    if (WRITE_INTERMEDIATE_DATA) {
        writeFileSync(
            join(DATA_FOLDER_PATH, "tracks-from-music-app.json"),
            JSON.stringify(musicAppTracksByLocation, undefined, 2),
        );
    }

    let numTracksFoundInMusicApp = 0;
    let numTracksNotPresentInMusicApp = 0;
    // let swinsianTracks: Record<BasicTrackProperty, any>[] = [];
    forEachTrackInLibrary(swinsianLibrary, (track, addProperty, updateProperty) => {
        // swinsianTracks.push(track);

        // Step 0. check which of these tracks we can query for info from Music.app library
        const trackDefinitionFromMusicApp = musicAppTracksByLocation[track.Location];
        if (trackDefinitionFromMusicApp === undefined) {
            numTracksNotPresentInMusicApp++;
        } else {
            numTracksFoundInMusicApp++;
        }

        // Step 1. insert Persistent ID from Music.app
        const persistentIdFromMusicApp: string | undefined =
            trackDefinitionFromMusicApp?.["Persistent ID"];
        const persistentIdAsHexString = parseInt(track["Persistent ID"], 10)
            .toString(16)
            .padStart(16, "0");
        updateProperty("Persistent ID", persistentIdFromMusicApp ?? persistentIdAsHexString);

        // Step 2. insert Kind as "string" property by looking at file name
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
        addProperty("Kind", "string", `${kind} audio file`);

        // Step 3. insert File Folder Count and Library Folder Count from Music.app (use -1 if not found)
        addProperty(
            "File Folder Count",
            "integer",
            trackDefinitionFromMusicApp?.["File Folder Count"] ?? -1,
        );
        addProperty(
            "Library Folder Count",
            "integer",
            trackDefinitionFromMusicApp?.["Library Folder Count"] ?? -1,
        );
    });

    console.info(dedent`
        Updated Swinsian track definitions to include Music.app properties.
        Found ${numTracksFoundInMusicApp} tracks in Music.app library,
        but had to generate info for ${numTracksNotPresentInMusicApp} remaining tracks.
    `);

    if (WRITE_INTERMEDIATE_DATA) {
        // writeFileSync(
        //     join(DATA_FOLDER_PATH, "swinsian-tracks.json"),
        //     JSON.stringify(swinsianTracks, undefined, 2),
        // );
        console.info(`Writing modified library as JSON`);
        writeFileSync(
            join(DATA_FOLDER_PATH, "swinsian-modified-library.json"),
            JSON.stringify(swinsianLibrary, undefined, 2),
        );
    }

    console.info(`Building modified library`);
    let outputXml = buildXmlOutput(swinsianLibrary);
    // N.B. the order of these transformations is intentional
    outputXml = reEncodeHtmlEntities(outputXml);
    outputXml = replaceUnpairedTagsWithSelfClosingTags(outputXml);
    outputXml = collapsePropertiesIntoSingleLine(outputXml);
    outputXml = injectDoctypeIntoXmlString(outputXml);

    console.info(`Writing modified library to ${OUTPUT_LIBRARY_PATH}`);
    writeFileSync(OUTPUT_LIBRARY_PATH, outputXml);
}

import { existsSync, writeFileSync } from "node:fs";

import { forEachTrackInLibrary } from "./visitDefinitions.mjs";
import { convertSwinsianTrackToMusicAppTrack, SwinsianTrackDefinition } from "../models/tracks.mjs";
import { loadPlistFile, buildPlistOutput } from "./plist.mjs";
import { reEncodeHtmlEntities } from "../utils/xmlUtils.mjs";

export * from "./consts.mjs";

export default function (inputLibraryPath: string, outputLibraryPath: string) {
    if (!existsSync(inputLibraryPath)) {
        throw new Error(
            `[music-library-scripts] No file found at ${inputLibraryPath}, please make sure it exists.`,
        );
    }
    if (!existsSync(outputLibraryPath)) {
        throw new Error(
            `[music-library-scripts] No output folder found at ${outputLibraryPath}, please make sure it exists.`,
        );
    }

    const swinsianLibrary = loadPlistFile(inputLibraryPath);

    forEachTrackInLibrary(swinsianLibrary, (track) => {
        const newTrackDefinition = convertSwinsianTrackToMusicAppTrack(
            track as SwinsianTrackDefinition,
        );
        swinsianLibrary.Tracks[track["Track ID"]] = newTrackDefinition;
    });

    console.info(`Building modified library`);
    let outputPlist = buildPlistOutput(swinsianLibrary);
    outputPlist = reEncodeHtmlEntities(outputPlist);

    console.info(`Writing modified library to ${outputLibraryPath}`);
    writeFileSync(outputLibraryPath, outputPlist);
}

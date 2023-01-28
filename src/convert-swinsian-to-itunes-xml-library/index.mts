import { writeFileSync } from "node:fs";

import { forEachTrackInLibrary } from "./visitDefinitions.mjs";
import { convertSwinsianTrackToMusicAppTrack, SwinsianTrackDefinition } from "../models/tracks.mjs";
import { loadPlistFile, buildPlistOutput } from "./plist.mjs";
import { reEncodeHtmlEntities } from "../utils/xmlUtils.mjs";

export * from "./consts.mjs";

export default function (inputLibraryPath: string, outputLibraryPath: string) {
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

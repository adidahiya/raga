import { existsSync, writeFileSync } from "node:fs";

import { forEachTrackInLibrary } from "./visitDefinitions.js";
import { convertSwinsianTrackToMusicAppTrack, SwinsianTrackDefinition } from "../models/tracks.js";
import { buildPlistOutput } from "./plist.js";
import { reEncodeHtmlEntities } from "../utils/xmlUtils.js";
import loadSwinsianLibrary from "./loadSwinsianLibrary.js";

export { loadSwinsianLibrary };

export * from "./consts.js";

export default function (inputLibraryPath: string, outputLibraryPath: string) {
    if (!existsSync(outputLibraryPath)) {
        throw new Error(
            `[music-library-scripts] No output folder found at ${outputLibraryPath}, please make sure it exists.`,
        );
    }

    const swinsianLibrary = loadSwinsianLibrary(inputLibraryPath);

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

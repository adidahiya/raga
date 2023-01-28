import { writeFileSync } from "node:fs";

import { forEachTrackInLibrary } from "./visitDefinitions.mjs";
import { convertSwinsianTrackToMusicAppTrack, SwinsianTrackDefinition } from "../tracks.mjs";
import { loadPlistFile, buildPlistOutput } from "./plist.mjs";
import { OUTPUT_LIBRARY_PATH, SWINSIAN_LIBRARY_PATH } from "../consts.mjs";
import { reEncodeHtmlEntities } from "../xmlUtils.mjs";

export default function () {
    const swinsianLibrary = loadPlistFile(SWINSIAN_LIBRARY_PATH);

    forEachTrackInLibrary(swinsianLibrary, (track) => {
        const newTrackDefinition = convertSwinsianTrackToMusicAppTrack(
            track as SwinsianTrackDefinition,
        );
        swinsianLibrary.Tracks[track["Track ID"]] = newTrackDefinition;
    });

    console.info(`Building modified library`);
    let outputPlist = buildPlistOutput(swinsianLibrary);
    outputPlist = reEncodeHtmlEntities(outputPlist);

    console.info(`Writing modified library to ${OUTPUT_LIBRARY_PATH}`);
    writeFileSync(OUTPUT_LIBRARY_PATH, outputPlist);
}

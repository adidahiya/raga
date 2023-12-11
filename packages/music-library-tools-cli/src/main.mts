import dedent from "dedent";
import { argv } from "node:process";
import parseArgs from "minimist";
import prompts from "prompts";

import {
    convertSwinsianToItunesXmlLibrary,
    getDefaultSwinsianExportFolder,
    getOutputLibraryPath,
    getSwinsianLibraryPath,
    loadSwinsianLibrary,
    serializeLibraryPlist,
} from "@adahiya/music-library-tools-lib";
import { existsSync, writeFileSync } from "node:fs";

const args = parseArgs(argv.slice(1), {
    boolean: ["help", "non-interactive"],
    alias: {
        i: "non-interactive",
    },
});

if (args.help) {
    console.info(dedent`
        music-library-scripts

        Description:
            Run various scripts to manage your music library.

        Options:
            --non-interactive: skip interactive prompts and just run the default script.
    `);
}

const enum ScriptId {
    ConvertSwinsianLibrary,
}

let whichScript = ScriptId.ConvertSwinsianLibrary;
let libraryLocation = getDefaultSwinsianExportFolder();

if (!args["non-interactive"]) {
    const answers = await prompts([
        {
            type: "select",
            name: "whichScript",
            message: "Which script would you like to run?",
            choices: [
                {
                    title: "Convert Swinsian library to Music.app/iTunes XML format",
                    value: ScriptId.ConvertSwinsianLibrary,
                },
            ],
            initial: 0,
        },
        {
            type: "text",
            name: "libraryLocation",
            message: "Where is your exported SwinsianLibrary.xml located?",
            initial: getDefaultSwinsianExportFolder(),
        },
    ]);
    whichScript = answers.whichScript;
    libraryLocation = answers.libraryLocation;
}

if (whichScript === ScriptId.ConvertSwinsianLibrary) {
    const inputLibraryPath = getSwinsianLibraryPath(libraryLocation);
    const outputLibraryPath = getOutputLibraryPath(libraryLocation);

    if (!existsSync(outputLibraryPath)) {
        throw new Error(
            `[music-library-scripts] No output folder found at ${outputLibraryPath}, please make sure it exists.`,
        );
    }

    const swinsianLibrary = loadSwinsianLibrary(inputLibraryPath);
    console.info(`Building modified library`);
    const modifiedLibrary = convertSwinsianToItunesXmlLibrary(swinsianLibrary);
    const serializedLibrary = serializeLibraryPlist(modifiedLibrary);

    console.info(`Writing modified library to ${outputLibraryPath}`);
    writeFileSync(outputLibraryPath, serializedLibrary);
}

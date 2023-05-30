import dedent from "dedent";
import { parseArgs } from "node:util";
import prompts from "prompts";

import {
    convertSwinsianToItunesXmlLibrary,
    DEFAULT_SWINSIAN_EXPORT_FOLDER,
    getSwinsianLibraryPath,
    getOutputLibraryPath,
} from "@adahiya/music-library-tools-lib";

const args = parseArgs({
    options: {
        "non-interactive": {
            type: "boolean",
            short: "i",
        },
        help: {
            type: "boolean",
        },
    },
});

if (args.values.help) {
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
let libraryLocation = DEFAULT_SWINSIAN_EXPORT_FOLDER;

if (!args.values["non-interactive"]) {
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
            initial: DEFAULT_SWINSIAN_EXPORT_FOLDER,
        },
    ]);
    whichScript = answers.whichScript;
    libraryLocation = answers.libraryLocation;
}

if (whichScript === ScriptId.ConvertSwinsianLibrary) {
    convertSwinsianToItunesXmlLibrary(
        getSwinsianLibraryPath(libraryLocation),
        getOutputLibraryPath(libraryLocation),
    );
}

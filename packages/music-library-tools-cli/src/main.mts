import dedent from "dedent";
import { argv } from "node:process";
import parseArgs from "minimist";
import prompts from "prompts";

import {
    convertSwinsianToItunesXmlLibrary,
    DEFAULT_SWINSIAN_EXPORT_FOLDER,
    getSwinsianLibraryPath,
    getOutputLibraryPath,
} from "@adahiya/music-library-tools-lib";

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
let libraryLocation = DEFAULT_SWINSIAN_EXPORT_FOLDER;

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

import prompts from "prompts";

import convertSwinsianToItunesXmlLibrary, {
    DEFAULT_SWINSIAN_EXPORT_FOLDER,
    getSwinsianLibraryPath,
    getOutputLibraryPath,
} from "./convert-swinsian-to-itunes-xml-library/index.mjs";

const enum ScriptId {
    ConvertSwinsianLibrary,
}

const { whichScript, libraryLocation } = await prompts([
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

if (whichScript === ScriptId.ConvertSwinsianLibrary) {
    convertSwinsianToItunesXmlLibrary(
        getSwinsianLibraryPath(libraryLocation),
        getOutputLibraryPath(libraryLocation),
    );
}

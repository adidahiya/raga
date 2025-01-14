import { existsSync, writeFileSync } from "node:fs";
import { argv } from "node:process";

import {
  convertSwinsianToItunesXmlLibrary,
  getDefaultSwinsianExportFolder,
  getOutputLibraryPath,
  getSwinsianLibraryPath,
  loadSwinsianLibrary,
} from "@adahiya/raga-lib";
import dedent from "dedent";
import parseArgs from "minimist";
import prompts from "prompts";

const args = parseArgs(argv.slice(1), {
  boolean: ["help", "non-interactive"],
  alias: {
    i: "non-interactive",
  },
});

if (args.help) {
  console.info(dedent`
        raga-cli

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
  whichScript = answers.whichScript as ScriptId;
  libraryLocation = answers.libraryLocation as string;
}

// HACKHACK: there's only one kind of ScriptId, so ESLint correctly detects this as an unnecessary conditional.
// It's unlikely that we'll add more scripts now that the UI is under active development, but keep this execution
// pattern in place just in case we do.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (whichScript === ScriptId.ConvertSwinsianLibrary) {
  const inputLibraryPath = getSwinsianLibraryPath(libraryLocation);
  const outputLibraryPath = getOutputLibraryPath(libraryLocation);

  if (!existsSync(outputLibraryPath)) {
    throw new Error(
      `[raga-cli] No output folder found at ${outputLibraryPath}, please make sure it exists.`,
    );
  }

  const swinsianLibrary = loadSwinsianLibrary(inputLibraryPath);
  console.info(`Building modified library`);
  const modifiedLibrarySerialized = convertSwinsianToItunesXmlLibrary(swinsianLibrary);

  console.info(`Writing modified library to ${outputLibraryPath}`);
  writeFileSync(outputLibraryPath, modifiedLibrarySerialized);
}

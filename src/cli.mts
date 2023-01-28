/**
 * @fileoverview Right now, this CLI only accomlishes one task that is user-configurable
 * by editing the code.
 *
 * TODO: add yargs parsing, and/or a UI
 */

import createModifiedLibraryWithXmlParser from "./xml-parser/createModifiedSwinsianLibrary.mjs";
import createModifiedLibraryWithPlistParser from "./plist-parser/createModifiedSwinsianLibrary.mjs";
import { PARSING_STRATEGY } from "./consts.mjs";

switch (PARSING_STRATEGY) {
    case "xml":
        createModifiedLibraryWithXmlParser();
        break;
    case "plist":
        createModifiedLibraryWithPlistParser();
        break;
}

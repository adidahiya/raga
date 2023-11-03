import { existsSync } from "node:fs";

import type { MusicLibraryPlist } from "../models/library";
import { loadPlistFile } from "./plist.js";

export default function (inputLibraryPath: string): MusicLibraryPlist {
    if (!existsSync(inputLibraryPath)) {
        throw new Error(`No file found at ${inputLibraryPath}, please make sure it exists.`);
    }

    return loadPlistFile(inputLibraryPath);
}

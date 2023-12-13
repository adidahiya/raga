import { existsSync } from "node:fs";

import type { SwinsianLibraryPlist } from "../models/library";
import { loadPlistFile } from "../utils/plistUtils.js";

export default function loadSwinsianLibrary(inputLibraryPath: string): SwinsianLibraryPlist {
    if (!existsSync(inputLibraryPath)) {
        throw new Error(`[lib] No file found at ${inputLibraryPath}, please make sure it exists.`);
    }

    return loadPlistFile(inputLibraryPath) as unknown as SwinsianLibraryPlist;
}

import { existsSync } from "node:fs";

import type { SwinsianLibraryPlist } from "@adahiya/raga-types";

import { LibErrors } from "../common/errrorMessages.js";
import { loadPlistFile } from "../utils/plistUtils.js";

export default function loadSwinsianLibrary(inputLibraryPath: string): SwinsianLibraryPlist {
  if (!existsSync(inputLibraryPath)) {
    throw new Error(LibErrors.libraryInputPathNotFound(inputLibraryPath));
  }

  return loadPlistFile(inputLibraryPath) as unknown as SwinsianLibraryPlist;
}

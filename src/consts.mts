import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const PARSING_STRATEGY: string = "plist";

// user-configurable paths

/** @deprecated */
export const MUSIC_LIBRARY_PATH = "/Users/adi/Music/Music/Library Export 2023-01-06.xml";
export const SWINSIAN_EXPORT_FOLDER = "/Users/adi/Music/Swinsian export/Latest";

export const SWINSIAN_LIBRARY_PATH = join(SWINSIAN_EXPORT_FOLDER, "SwinsianLibrary.xml");
export const OUTPUT_LIBRARY_PATH = join(SWINSIAN_EXPORT_FOLDER, "ModifiedLibrary.xml");

// for debugging only
export const WRITE_INTERMEDIATE_DATA = false;
export const DATA_FOLDER_PATH = join(
    fileURLToPath(new URL("../data", import.meta.url)),
    `${PARSING_STRATEGY}-parser`,
);

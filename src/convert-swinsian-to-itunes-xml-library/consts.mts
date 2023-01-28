import { join } from "node:path";

// user-configurable path
export const DEFAULT_SWINSIAN_EXPORT_FOLDER = "/Users/adi/Music/Swinsian export/Latest";

export const getSwinsianLibraryPath = (swinsianExportFolder = DEFAULT_SWINSIAN_EXPORT_FOLDER) =>
    join(swinsianExportFolder, "SwinsianLibrary.xml");
export const getOutputLibraryPath = (swinsianExportFolder = DEFAULT_SWINSIAN_EXPORT_FOLDER) =>
    join(swinsianExportFolder, "ModifiedLibrary.xml");

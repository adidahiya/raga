import { join } from "node:path";
import { homedir } from "node:os";

export const DEFAULT_SWINSIAN_EXPORT_FOLDER = join(homedir(), "Music", "Swinsian export", "Latest");

export const getSwinsianLibraryPath = (swinsianExportFolder = DEFAULT_SWINSIAN_EXPORT_FOLDER) =>
    join(swinsianExportFolder, "SwinsianLibrary.xml");
export const getOutputLibraryPath = (swinsianExportFolder = DEFAULT_SWINSIAN_EXPORT_FOLDER) =>
    join(swinsianExportFolder, "ModifiedLibrary.xml");

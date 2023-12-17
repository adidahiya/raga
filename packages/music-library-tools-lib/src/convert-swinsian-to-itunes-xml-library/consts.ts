import { homedir } from "node:os";
import { join } from "node:path";

export const getDefaultSwinsianExportFolder = () =>
    join(homedir(), "Music", "Swinsian export", "Latest");

export const getSwinsianLibraryPath = (swinsianExportFolder = getDefaultSwinsianExportFolder()) =>
    join(swinsianExportFolder, "SwinsianLibrary.xml");
export const getOutputLibraryPath = (swinsianExportFolder = getDefaultSwinsianExportFolder()) =>
    join(swinsianExportFolder, "ModifiedLibrary.xml");

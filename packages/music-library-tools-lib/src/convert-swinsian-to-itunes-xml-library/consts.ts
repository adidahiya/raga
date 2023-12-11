import { join } from "node:path";
import { homedir } from "node:os";

export const getDefaultSwinsianExportFolder = () =>
    join(homedir(), "Music", "Swinsian export", "Latest");

export const getSwinsianLibraryPath = (swinsianExportFolder = getDefaultSwinsianExportFolder()) =>
    join(swinsianExportFolder, "SwinsianLibrary.xml");
export const getOutputLibraryPath = (swinsianExportFolder = getDefaultSwinsianExportFolder()) =>
    join(swinsianExportFolder, "ModifiedLibrary.xml");

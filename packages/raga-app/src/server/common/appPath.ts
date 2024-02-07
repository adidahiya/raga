import { join, resolve } from "node:path";

import appRootDir from "app-root-dir";

// The "electron" module is not available in the server utility process, so we must get the app path ourselves
// Note that "app-root-dir" returns a path inside the .vite/ folder, so we must go up one level.
export const appPath = resolve(join(appRootDir.get(), ".."));

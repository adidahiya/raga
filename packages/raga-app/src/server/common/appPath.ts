import { basename, join, resolve } from "node:path";

import appRootDir from "app-root-dir";

const rootDir = appRootDir.get();

// The "electron" module is not available in the server utility process, so we must get the app path ourselves
export const appPath = resolve(
  // N.B. "app-root-dir" returns a path inside the .vite/ folder in the forge-packaged distribution,
  // so we must go up one level in that case.
  basename(rootDir) === ".vite" ? join(rootDir, "..") : rootDir,
);

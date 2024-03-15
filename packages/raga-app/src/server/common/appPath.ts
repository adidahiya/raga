import { join, resolve } from "node:path";

import { findUpSync } from "find-up";

// The "electron" module is not available in the server utility process, so we must get the app path ourselves

const rootDir = findUpSync(".vite", { cwd: import.meta.dirname, type: "directory" });

if (rootDir === undefined) {
  throw new Error("[server] Could not find the root directory of the app");
}

export const appPath = resolve(join(rootDir, ".."));

import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";

export default {
  packagerConfig: {
    executableName: "raga-app",
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
  ],
  hooks: {
    packageAfterCopy: async (_forgeConfig, buildPath, _electronVersion, _platform, _arch) => {
      // HACKHACK: manually copy bin/ folder to the build path since `assetsInclude` stopped working in electron-forge v7.3.0
      // we should definitely consider migrating to electron-builder... this is getting tedious 🙁
      const binFilesToCopy = readdirSync(join(cwd(), "bin"));
      if (binFilesToCopy.length > 0) {
        mkdirSync(join(buildPath, "bin"), { recursive: true });
        for (const file of binFilesToCopy) {
          copyFileSync(join(cwd(), "bin", file), join(buildPath, "bin", file));
        }
      }
    },
  },
  plugins: [
    {
      name: "@electron-forge/plugin-vite",
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Vite configuration, it will look really familiar.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: "src/main.ts",
            config: "vite.main.config.js",
          },
          {
            entry: "src/preload.ts",
            config: "vite.preload.config.js",
          },
          {
            entry: "src/server.ts",
            config: "vite.main.config.js",
          },
        ],
        renderer: [
          {
            name: "main_window",
            config: "vite.renderer.config.js",
          },
        ],
      },
    },
  ],
};

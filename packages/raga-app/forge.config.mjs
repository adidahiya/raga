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
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          genericName: "Raga",
          bin: "raga-app",
        },
      },
    },
  ],
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
            config: "vite.main.config.mjs",
            target: "main",
          },
          {
            entry: "src/preload.ts",
            config: "vite.preload.config.mjs",
            target: "preload",
          },
          {
            entry: "src/server.ts",
            config: "vite.main.config.mjs",
            target: "main",
          },
        ],
        renderer: [
          {
            name: "main_window",
            config: "vite.renderer.config.mjs",
            target: "renderer",
          },
        ],
      },
    },
  ],
};

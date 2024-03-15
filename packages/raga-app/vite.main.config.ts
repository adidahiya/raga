import { type ConfigEnv, defineConfig, mergeConfig, type UserConfig } from "vite";

import { external, getBuildConfig, getBuildDefine, pluginHotRestart } from "./vite.base.config";

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<"build">;
  const { forgeConfigSelf } = forgeEnv;
  const define = getBuildDefine(forgeEnv);
  const config: UserConfig = {
    // HACKHACK: assetsInclude doesn't seem to work in electron-forge v7.3.x, so we manually copy over
    // the binaries in this directory in the `packageAfterCopy` hook, see forge.config.js
    assetsInclude: ["./bin/*"],
    build: {
      lib: {
        entry: forgeConfigSelf.entry!,
        fileName: () => "[name].js",
        formats: ["es"],
      },
      rollupOptions: {
        external,
      },
    },
    plugins: [pluginHotRestart("restart")],
    define,
    resolve: {
      // Load the Node.js entry.
      mainFields: ["module", "jsnext:main", "jsnext"],
    },
  };

  return mergeConfig(getBuildConfig(forgeEnv), config);
});

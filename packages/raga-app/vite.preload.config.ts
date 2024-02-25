import { type ConfigEnv, defineConfig, mergeConfig, type UserConfig } from "vite";

import { external, getBuildConfig, pluginHotRestart } from "./vite.base.config";

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<"build">;
  const { forgeConfigSelf } = forgeEnv;
  const config: UserConfig = {
    build: {
      rollupOptions: {
        external,
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: forgeConfigSelf.entry!,
        output: {
          format: "cjs",
          // It should not be split chunks.
          inlineDynamicImports: true,
          entryFileNames: "[name].cjs",
          chunkFileNames: "[name].cjs",
          assetFileNames: "[name].[ext]",
        },
      },
      // target: "esnext",
    },
    plugins: [pluginHotRestart("reload")],
  };

  return mergeConfig(getBuildConfig(forgeEnv), config);
});

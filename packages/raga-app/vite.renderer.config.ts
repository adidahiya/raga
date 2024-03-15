import { sassNodeModulesLoadPaths } from "@blueprintjs/node-build-scripts";
import react from "@vitejs/plugin-react";
import { type ConfigEnv, defineConfig, type UserConfig } from "vite";

import { pluginExposeRenderer } from "./vite.base.config";

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<"renderer">;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? "";

  return {
    root,
    mode,
    base: "./",
    build: {
      outDir: `.vite/renderer/${name}`,
      target: "esnext",
    },
    css: {
      preprocessorOptions: {
        sass: {
          loadPaths: sassNodeModulesLoadPaths,
        },
      },
    },
    plugins: [pluginExposeRenderer(name), react()],
    publicDir: "./src/client/assets",
    resolve: {
      preserveSymlinks: true,
    },
    clearScreen: false,
  } satisfies UserConfig;
});

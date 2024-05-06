import { sassNodeModulesLoadPaths } from "@blueprintjs/node-build-scripts";
import { VitePluginWatchWorkspace } from "@prosopo/vite-plugin-watch-workspace";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    react(),
    VitePluginWatchWorkspace({
      workspaceRoot: "../../",
      currentPackage: "./",
      format: "esm", // 'esm' or 'cjs'
      fileTypes: ["ts", "tsx", "mjs"],
      ignorePaths: ["node_modules", "dist"],
    }),
  ],
  publicDir: "./src/client/assets",
  build: {
    target: "esnext",
  },
  cssPreprocessOptions: {
    sass: {
      loadPaths: sassNodeModulesLoadPaths,
    },
  },
});

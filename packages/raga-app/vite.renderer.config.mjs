import { sassNodeModulesLoadPaths } from "@blueprintjs/node-build-scripts";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
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

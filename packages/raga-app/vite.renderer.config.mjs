import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import htmlPlugin from "vite-plugin-html-config";

import { loadPaths as sassNodeModulesLoadPaths } from "./script/sassNodeModulesLoadPaths.mjs";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    htmlPlugin({
      // Latest react devtools only work in Electron via script tag loaded before React on the page
      // see https://github.com/electron/electron/issues/41613#issuecomment-2090365372
      headScripts: process.env.NODE_ENV === "development" ? [{ src: "http://localhost:8097" }] : [],
    }),
    react(),
  ],
  // Use the web app's assets directory
  publicDir: "../raga-web-app/src/assets",
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      // Ensure proper resolution of the web app package
      "@adahiya/raga-web-app": "../raga-web-app",
    },
  },
  cssPreprocessOptions: {
    sass: {
      loadPaths: sassNodeModulesLoadPaths,
    },
  },
});

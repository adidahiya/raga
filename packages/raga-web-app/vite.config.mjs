import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import htmlPlugin from "vite-plugin-html-config";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    htmlPlugin({
      // No electron-specific scripts for the standalone web app
    }),
    react(),
  ],
  publicDir: "./src/assets",
  build: {
    target: "esnext",
    outDir: "dist",
  },
  server: {
    port: 3000,
    open: true,
  },
});

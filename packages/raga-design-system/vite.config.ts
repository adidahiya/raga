import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

import { writeTokensCss } from "./scripts/generate-tokens-css.ts";

const TOKENS_TS = path.resolve(import.meta.dirname, "src/tokens/tokens.ts");

function tokensCssGen(): Plugin {
  return {
    name: "raga-design-system:tokens-css",
    buildStart() {
      writeTokensCss();
      this.addWatchFile(TOKENS_TS);
    },
    handleHotUpdate({ file, server }) {
      if (path.resolve(file) === TOKENS_TS) {
        writeTokensCss();
        server.ws.send({ type: "full-reload" });
      }
    },
  };
}

export default defineConfig({
  plugins: [tokensCssGen(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  build: {
    target: "esnext",
    outDir: "dist",
    emptyOutDir: true,
  },
});

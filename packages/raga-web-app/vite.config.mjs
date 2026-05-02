import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import htmlPlugin from "vite-plugin-html-config";

const isDev = process.env.NODE_ENV !== "production";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    htmlPlugin({
      // No electron-specific scripts for the standalone web app
    }),
    react(),
    // Tailwind v4 powers both the design-system primitives (consumed across the
    // app via @adahiya/raga-design-system) and the dev-only `/__kitchen-sink`
    // route, so it's always-on.
    tailwindcss(),
    ...(isDev && process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-runtime-error-modal").then((m) =>
            m.default(),
          ),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  publicDir: "./src/assets",
  build: {
    target: "esnext",
    outDir: "dist",
  },
  server: {
    port: 5000,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});

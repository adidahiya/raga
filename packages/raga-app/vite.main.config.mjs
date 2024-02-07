import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  assetsInclude: ["./bin/*"],
  resolve: {
    alias: {
      // buggy conditional import in node-fluent-ffmpeg, see https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/573#issuecomment-1082586875
      "./lib-cov/fluent-ffmpeg": "./lib/fluent-ffmpeg",
    },
  },
});

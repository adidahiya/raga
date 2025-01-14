import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

console.log("********* VITE CONFIG *********");
console.log(resolve(__dirname, "bin", "raga-lib-native.darwin-arm64.node"));

// https://vitejs.dev/config
export default defineConfig({
  assetsInclude: ["./bin/*"],
  resolve: {
    alias: {
      "@adahiya/raga-lib-native-darwin-arm64": resolve(
        __dirname,
        "bin",
        "raga-lib-native.darwin-arm64.node",
      ),
      // buggy conditional import in node-fluent-ffmpeg, see https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/573#issuecomment-1082586875
      "./lib-cov/fluent-ffmpeg": "./lib/fluent-ffmpeg",
    },
  },
});

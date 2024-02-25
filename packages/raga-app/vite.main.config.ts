import { type ConfigEnv, defineConfig, mergeConfig, type UserConfig } from "vite";

import { external, getBuildConfig, getBuildDefine, pluginHotRestart } from "./vite.base.config";

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<"build">;
  const { forgeConfigSelf } = forgeEnv;
  const define = getBuildDefine(forgeEnv);
  const config: UserConfig = {
    assetsInclude: ["./bin/*"],
    build: {
      lib: {
        entry: forgeConfigSelf.entry!,
        fileName: () => "[name].js",
        formats: ["es"],
      },
      rollupOptions: {
        external,
      },
      // target: "esnext",
    },
    plugins: [pluginHotRestart("restart")],
    define,
    resolve: {
      // Load the Node.js entry.
      mainFields: ["module", "jsnext:main", "jsnext"],
      alias: {
        // buggy conditional import in node-fluent-ffmpeg, see https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/573#issuecomment-1082586875
        "./lib-cov/fluent-ffmpeg": "./lib/fluent-ffmpeg",
      },
    },
  };

  return mergeConfig(getBuildConfig(forgeEnv), config);
});

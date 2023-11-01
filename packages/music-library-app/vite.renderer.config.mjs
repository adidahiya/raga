import { sassNodeModulesLoadPaths } from "@blueprintjs/node-build-scripts";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
    cssPreprocessOptions: {
        sass: {
            loadPaths: sassNodeModulesLoadPaths,
        },
    },
});

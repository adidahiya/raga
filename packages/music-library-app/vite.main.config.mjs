import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
    build: {
        target: "esnext",
        rollupOptions: {
            output: {
                // esModule: true,
                format: "es",
            },
        },
    },
});

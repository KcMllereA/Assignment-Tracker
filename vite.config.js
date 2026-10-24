import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [react()],

        base: env.VITE_BASE_PATH || "/",
        build: {
            emptyOutDir: true
        },
        test: {
            globals: true,
            passWithNoTests: true,
            environment: "node"
        }
    };
});

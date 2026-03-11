import { defineConfig } from "vite"
import { solidPlugin } from "vite-plugin-solid"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
    envDir: fileURLToPath(new URL("../..", import.meta.url)),
    plugins: [solidPlugin()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            target: "esnext",
        },
    },
})

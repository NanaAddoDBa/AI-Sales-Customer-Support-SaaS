import { defineConfig } from "vite";
export default defineConfig({
  server: {
    port: 5183,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:19311",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});

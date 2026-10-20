import { defineConfig } from "vite";
export default defineConfig({
  build: {
    rollupOptions: {
      input: { chat: "index.html", loader: "src/loader/index.ts" },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "loader" ? "loader.js" : "assets/[name]-[hash].js",
      },
    },
  },
});

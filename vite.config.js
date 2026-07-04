import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 750,
    minify: "esbuild",
    sourcemap: false,
    target: "es2020"
  }
});

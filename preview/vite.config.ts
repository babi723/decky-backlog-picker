import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Local UI preview only — separate from the plugin's real rollup build.
// Aliases @decky/ui and @decky/api to local stubs so src/index.tsx can
// render in a plain browser without a real Decky Loader runtime.
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      "@decky/ui": path.resolve(__dirname, "decky-ui-stub.tsx"),
      "@decky/api": path.resolve(__dirname, "decky-api-stub.ts"),
    },
  },
  server: {
    port: 5173,
  },
});

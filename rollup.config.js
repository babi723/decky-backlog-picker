import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import fs from "fs";

const pluginManifest = JSON.parse(fs.readFileSync("plugin.json", "utf-8"));

// @decky/api imports "@decky/manifest" expecting { name: <plugin.json name> }
// to identify this plugin when connecting to Decky Loader's backend bridge.
// It isn't an installable package or a runtime browser global (unlike
// react/@decky/ui) — the real @decky/rollup build tool provides it as a
// virtual module, so we do the same here rather than treating it as an
// external global (which doesn't exist and crashes the plugin on load).
function deckyManifest() {
      const id = "@decky/manifest";
      return {
            name: "decky-manifest",
            resolveId(source) {
                  if (source === id) return id;
            },
            load(resolvedId) {
                  if (resolvedId === id) {
                        return `export default ${JSON.stringify({ name: pluginManifest.name })};`;
                  }
            },
      };
}

export default {
      input: "src/index.tsx",
      plugins: [
              deckyManifest(),
              commonjs(),
              nodeResolve(),
              typescript(),
              json(),
              replace({
                        preventAssignment: false,
                        "process.env.NODE_ENV": JSON.stringify("production"),
              }),
            ],
      external: ["react", "react-dom", "@decky/ui"],
      output: {
              file: "dist/index.js",
              globals: {
                        react: "SP_REACT",
                        "react-dom": "SP_REACTDOM",
                        "@decky/ui": "DFL",
              },
              format: "iife",
              name: "BacklogPicker",
              exports: "default",
      },
};

import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

export default {
    input: "src/index.tsx",
    plugins: [
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

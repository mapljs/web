#!/usr/bin/env node
import build from "@mapl/web_dev/build/rolldown";
import terser from "@rollup/plugin-terser";

build({
  input: "./server.ts",
  output: {
    file: "./server_built.js",
  },
  finalizeOptions: {
    plugins: terser({
      compress: {
        passes: 3,
      },
      mangle: false,
    }),
  },
  target: "bun",
});

#!/usr/bin/env node
import { dev } from "@mapl/web_dev/build/rolldown";

dev({
  input: "./server.ts",
  output: {
    file: "./server_dev.js",
  },
  target: "bun",
}).on("change", (e) => {
  // When server changed
  console.log(e);
});

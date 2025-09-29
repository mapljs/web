// @ts-check
import options from "./build/index.js";

const server = Bun.serve({
  routes: options,
  port: 3000,
});

console.log('Server started at', server.url.href);

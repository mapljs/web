// @ts-check
import options from "../build/server-exports.js";
const server = Bun.serve(options);
console.log("Server started at", server.url.href);

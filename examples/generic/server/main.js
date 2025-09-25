// @ts-check
import options from "../build/server-exports.js";
import serveOptions from "./options.js";
import { serve } from "winter-compat/node";

serve(options.fetch, serveOptions).then(() => {
  console.log("Server started at port 3000");
});

// @ts-check
import options from "../build/server-exports.js";
import { serve } from "winter-compat";

serve(options.fetch, {
  port: 3000,
}).then(() => {
  console.log("Server started at port 3000");
});

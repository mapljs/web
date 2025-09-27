// @ts-check
import options from "../build/server-exports.js";
import { serve } from "srvx";

serve({
  ...options,
  port: 3000,
});

// @ts-check
import options from "./build/index.js";
import { serve } from "srvx";

serve({
  fetch: options,
  port: 3000,
});

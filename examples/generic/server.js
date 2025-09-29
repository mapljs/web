// @ts-check
import options from "./build/index.js";
import { serve } from "srvx";

serve({
  ...options,
  port: 3000,
});

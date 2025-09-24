// @ts-check
import options from "../build/server-exports.js";
import { serve } from "winter-compat";

// Runtime agnostic server (You can change to whatever u want)
serve(options.fetch, options);

import { build } from "@mapl/web/bun";
import { getDependency } from "runtime-compiler";
import main from "./main.ts";

Bun.serve({
  routes: getDependency(build(main))
});

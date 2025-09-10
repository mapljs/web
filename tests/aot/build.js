import app from "./main.js";
import { compileToString } from "@mapl/web/compiler/jit";

import { rolldown } from "rolldown";
import { minifySync } from "@swc/core";
import { writeFileSync, readFileSync } from "node:fs";

const ENTRY = import.meta.dir + "/index.js";

writeFileSync(
  ENTRY,
  `
    import app from '${import.meta.resolve("./main.js")}';
    import hydrate from '../../lib/compiler/aot.js';

    import { isHydrating } from "../../lib/compiler/config.js";
    if (!isHydrating) throw new Error('Invalid state!');

    export default {
      fetch: (${compileToString(app)})(...hydrate(app))
    };
  `,
);
const input = await rolldown({
  input: ENTRY,
  treeshake: {
    propertyReadSideEffects: false,
    moduleSideEffects: false,
  },
  transform: {
    typescript: {
      rewriteImportExtensions: true,
    },
  },
});
const output = await input.generate({
  minify: {
    mangle: false,
  },
});
writeFileSync(ENTRY, output.output[0].code);

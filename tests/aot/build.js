import app from './main.js';
import { compileToString } from '@mapl/web/compiler/jit';

import { rolldown } from 'rolldown';
import { minifySync } from '@swc/core';
import { writeFileSync } from 'node:fs';

const ENTRY = import.meta.dir + '/index.js';

writeFileSync(
  ENTRY,
  `
    import "../../lib/compiler/aot-config.js";

    import app from '${import.meta.resolve('./main.js')}';
    import hydrate from '../../lib/compiler/aot.js';

    export default {
      fetch: (${compileToString(app)})(...hydrate(app))
    };
  `,
);
const input = await rolldown({
  input: ENTRY,
  transform: {
    typescript: {
      rewriteImportExtensions: true,
    },
  },
});
const output = await input.generate();
const code = minifySync(output.output[0].code, {
  module: true,
  mangle: false,
}).code;

writeFileSync(ENTRY, code);

await Bun.$`bun fmt --write ./tests/aot`;

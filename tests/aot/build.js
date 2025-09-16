// @ts-check
// Currently works with terser
import app from './main.js';
import { compileToDependency } from '@mapl/web/compiler/jit';

import terser from '@rollup/plugin-terser';

import { writeFileSync } from 'node:fs';
import { evaluateToString } from 'runtime-compiler/jit';
import { minifySync } from '@swc/core';
import { rolldown } from 'rolldown';

const RAW = import.meta.dir + '/1.js';
const ENTRY = import.meta.dir + '/2.js';
const HANDLER = compileToDependency(app);

writeFileSync(
  RAW,
  `import 'runtime-compiler/hydrate-loader';

import app from './main.js';
import hydrateRouter from '../../lib/compiler/aot.js';
hydrateRouter(app);

import { hydrate } from 'runtime-compiler/hydrate';
(${evaluateToString()})(...hydrate());

import { getDependency } from 'runtime-compiler';
export default {
  fetch: getDependency(${HANDLER})
};`,
);
const input = await rolldown({
  input: RAW,
  plugins: [
    terser({
      module: true,
      mangle: false,
      compress: {
        passes: 3,
      },
    }),
  ],
});
const output = await input.write({
  file: ENTRY,
  inlineDynamicImports: true,
});

const code = output.output[0].code;
console.log(
  'minified size:',
  minifySync(code, {
    module: true,
  }).code.length,
);

await Bun.$`bun fmt --write ./tests/aot`;

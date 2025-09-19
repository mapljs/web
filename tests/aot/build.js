// @ts-check
// Currently works with terser
import app from './main.js';
import { compileToExportedDependency } from '@mapl/web/compiler/jit';

import terser from '@rollup/plugin-terser';

import { writeFileSync } from 'node:fs';
import { evaluateToString } from 'runtime-compiler/jit';
import { minifySync } from '@swc/core';
import { rolldown } from 'rolldown';

const RAW = import.meta.dir + '/1.js';
const ENTRY = import.meta.dir + '/2.js';
const HANDLER = compileToExportedDependency(app);

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

const code = minifySync(output.output[0].code, {
  module: true,
}).code;
console.log('minified size:', code.length);

await Bun.$`bun biome format --write ./tests/aot`;

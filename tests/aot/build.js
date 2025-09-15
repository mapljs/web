// @ts-check
// Currently works with rollup & terser
import app from './main.js';
import { injectCompiledHandler } from '@mapl/web/compiler/jit';

import { rollup } from 'rollup';
import terser from '@rollup/plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';

import { writeFileSync } from 'node:fs';
import { evaluateToString } from 'runtime-compiler/jit';
import { minifySync } from '@swc/core';

const RAW = import.meta.dir + '/1.js';
const ENTRY = import.meta.dir + '/2.js';
const HANDLER = injectCompiledHandler(app);

writeFileSync(
  RAW,
  `import 'runtime-compiler/hydrate-loader';

import app from './main.js';
import hydrateRouter from '../../lib/compiler/aot.js';
hydrateRouter(app);

import { getDependency } from 'runtime-compiler';
import { hydrate } from 'runtime-compiler/hydrate';
(${evaluateToString()})(...hydrate());

export default {
  fetch: getDependency(${HANDLER})
};`,
);
const input = await rollup({
  input: RAW,
  plugins: [
    terser({
      module: true,
      mangle: false,
      compress: {
        passes: 5,
      },
    }),
    nodeResolve(),
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

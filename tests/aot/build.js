import app from './main.js';
import { injectCompiledHandler } from '@mapl/web/compiler/jit';

import { rolldown } from 'rolldown';
import { minifySync } from '@swc/core';
import { writeFileSync } from 'node:fs';
import { evaluateToString } from 'runtime-compiler/jit';

const RAW = import.meta.dir + '/1.js';
const BUNDLED = import.meta.dir + '/2.js';
const ENTRY = import.meta.dir + '/3.js';
const HANDLER = injectCompiledHandler(app);

writeFileSync(
  RAW,
  `import "runtime-compiler/hydrate-loader";

import app from './main.js';
import hydrateRouter from '../../lib/compiler/aot.js';
hydrateRouter(app);

import { getDependency } from "runtime-compiler";
import { hydrate } from "runtime-compiler/hydrate";
(${evaluateToString()})(...hydrate());

export default {
  fetch: getDependency(${HANDLER})
};`,
);
const input = await rolldown({
  input: RAW,
  transform: {
    typescript: {
      rewriteImportExtensions: true,
    },
  },
});
const output = await input.write({
  file: BUNDLED,
  inlineDynamicImports: true,
  minify: 'dce-only',
});

const code = minifySync(output.output[0].code, {
  module: true,
  mangle: false,
  compress: {
    passes: 6,
  },
}).code;

writeFileSync(ENTRY, code);
console.log('minified size:', code.length);

await Bun.$`bun fmt --write ./tests/aot`;

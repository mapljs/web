// @ts-check
// Currently works with terser
import app from './main.js';
import { compileToExportedDependency } from '@mapl/web/compiler/jit';
import { compileToExportedDependency as bunCompileToExportedDependency } from '@mapl/web/compiler/bun/jit';

import terser from '@rollup/plugin-terser';

import { evaluateToString } from 'runtime-compiler/jit';
import { minifySync } from '@swc/core';
import { rolldown } from 'rolldown';
import { clear } from 'runtime-compiler';

/**
 * @param {string} target
 * @param {string} content
 */
const bundle = async (target, content) => {
  target = import.meta.dir + '/' + target;

  const aotOutput = target + ' (built).js';
  await Bun.write(aotOutput, content);

  const input = await rolldown({
    input: aotOutput,
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
    file: target + ' (bundled).js',
    inlineDynamicImports: true,
  });

  return minifySync(output.output[0].code, {
    module: true,
  }).code;
};

{
  const code = await bundle(
    'target-any-jit',
    `import app from './main.js';
import { compileToHandlerSync } from '../../lib/compiler/jit.js';

export default {
  fetch: compileToHandlerSync(app)
};`,
  );

  console.log('any jit - minified size:', code.length);
}

{
  const code = await bundle(
    'target-bun-jit',
    `import app from './main.js';
import { compileToHandlerSync } from '../../lib/compiler/bun/jit.js';

Bun.serve({
  routes: compileToHandlerSync(app)
});`,
  );

  console.log('bun jit - minified size:', code.length);
}

{
  clear();
  const HANDLER = compileToExportedDependency(app);

  const code = await bundle(
    'target-any-aot',
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

  console.log('any aot - minified size:', code.length);
}

{
  clear();
  const HANDLER = bunCompileToExportedDependency(app);

  const code = await bundle(
    'target-bun-aot',
    `import 'runtime-compiler/hydrate-loader';

import app from './main.js';
import hydrateRouter from '../../lib/compiler/bun/aot.js';
hydrateRouter(app);

import { hydrate } from 'runtime-compiler/hydrate';
(${evaluateToString()})(...hydrate());

import { getDependency } from 'runtime-compiler';
Bun.serve({
  routes: getDependency(${HANDLER})
});`,
  );

  console.log('bun aot - minified size:', code.length);
}

await Bun.$`bun biome format --write ./tests/aot`;

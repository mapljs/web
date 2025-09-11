import * as swc from '@swc/core';
import * as esbuild from 'esbuild';
import { rolldown } from 'rolldown';

const ENTRY = import.meta.dir + '/index.js';
const CONTENT = await Bun.file(ENTRY).text();

{
  const res = swc.minifySync(CONTENT, {
    module: true,
  });

  console.log('swc:', res.code);
}

{
  const input = await rolldown({
    input: ENTRY,
    treeshake: {
      propertyReadSideEffects: false,
      propertyWriteSideEffects: false,
      unknownGlobalSideEffects: false,
      moduleSideEffects: false,
    },
  });

  const res = await input.generate({
    esModule: true,
    minify: {
      mangle: {
        toplevel: true,
      },
    },
  });

  console.log('rolldown:', res.output[0].code);
}

{
  const res = esbuild.buildSync({
    entryPoints: [ENTRY],
    write: false,
    format: 'esm',
    treeShaking: true,
    minify: true,
  });

  console.log('esbuild:', res.outputFiles[0].text);
}

import app from './main.js';
import { compileToString } from '@mapl/web/compiler/jit';
import { rolldown } from 'rolldown';

const OUTDIR = import.meta.dir + '/';
const ENTRY = OUTDIR + 'index.js';

await Bun.write(ENTRY, `
  import app from './main.ts';
  import hydrate from '../../lib/compiler/aot.js';
  export default {
    fetch: (${compileToString(app)})(...hydrate(app))
  };
`);

const input = await rolldown({
  input: ENTRY,
  transform: {
    typescript: {
      rewriteImportExtensions: true
    }
  }
});

const output = await input.generate({
  inlineDynamicImports: true,
  minify: {
    compress: false,
    mangle: {
      toplevel: true
    }
  }
});

const code = output.output[0].code;
await Bun.write(ENTRY, code);

console.log('minified size:', code.length);

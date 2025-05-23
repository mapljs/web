import { rolldown } from 'rolldown';
import { globSync, writeFile } from 'node:fs';
import path from 'node:path';

import('./db.js')
  .catch(() => {})
  .finally(() => console.log('DB prepared successfully'));

(async () => {
  const inputFiles = globSync('src/*.ts');

  await Promise.all(
    inputFiles.map(async (input) => {
      const bundle = await rolldown({
        platform: 'node',
        input,
        external: ['better-sqlite3'],
      });

      await bundle.write({
        format: 'esm',
        minify: {
          compress: false,
          removeWhitespace: true,
          mangle: true,
        },
        dir: '.out',
      });
    }),
  );
  console.log('Build completed');

  writeFile(
    '.out/index.ts',
    `export default [${inputFiles.map((p) => "'" + path.resolve('.out', path.basename(p, 'ts') + 'js') + "'")}] as const`,
    (err) => {
      console.log(
        'Write entry files ' + (err === null ? 'completed' : 'failed'),
      );
    },
  );
})();

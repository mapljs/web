import { build } from 'rolldown';
import { globSync } from 'node:fs';

(async () => {
  await import('./db.js')
    .catch(() => {})
    .finally(() => console.log('DB is ready!'));

  await build({
    platform: 'node',
    input: globSync('src/*.ts'),
    output: {
      format: 'esm',
      minify: {
        compress: false,
        removeWhitespace: true,
        mangle: true,
      },
      dir: '.out',
    },
    treeshake: true,
  });
})();

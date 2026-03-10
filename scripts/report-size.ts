import { minify } from 'oxc-minify';
import { rolldown } from 'rolldown';

import { LIB, ROOT } from './utils.ts';

import { relative } from 'node:path/posix';

const toByte = (num: number) => (num >= 1e3 ? +(num / 1e3).toFixed(2) + 'kb' : num + 'b');
const toFileName = (str: string) => JSON.stringify(relative('.', str));

if (process.argv.length > 2) {
  const build = await rolldown({
    input: process.argv.slice(2).map((file) => ROOT + '/' + file),
    platform: 'node',
    transform: {
      typescript: {
        rewriteImportExtensions: true,
      },
    },
  });

  let totalSize = 0;
  let totalGzippedSize = 0;

  for (const output of (
    await build.generate({
      minify: true,
    })
  ).output) {
    if (output.type === 'asset') {
      for (const name of output.originalFileNames) console.log('  - asset:', name);
      continue;
    }
    console.log('-', toFileName(output.fileName));

    console.log('  - imports:');
    for (
      let j = 0,
        list = Object.keys(output.modules)
          .filter((k) => k !== '\u0000rolldown/runtime.js')
          .map(toFileName);
      j < list.length;
      j++
    )
      console.log('    +', list[j]);

    const code = new TextEncoder().encode(output.code);
    const size = code.byteLength;
    const gzippedSize = Bun.gzipSync(code).byteLength;

    totalSize += size;
    totalGzippedSize += gzippedSize;

    console.log('  - size:', toByte(size));
    console.log('  - gzipped size:', toByte(gzippedSize));
  }

  console.log('- total size:', toByte(totalSize));
  console.log('- gzipped size:', toByte(totalGzippedSize));

  process.exit(0);
}

const arr = await Promise.all(
  [...new Bun.Glob('**/*').scanSync(LIB)].map(async (path) => {
    const file = Bun.file(LIB + '/' + path);
    const code = await file.text();
    const minifiedCode = minify(path, code).code!;

    return {
      entry: path,
      size: file.size,
      minified: Buffer.from(minifiedCode).byteLength,
      gzip: Bun.gzipSync(code).byteLength,
      minifiedGzip: Bun.gzipSync(minifiedCode).byteLength,
    };
  }),
);

arr.push(
  arr.reduce(
    (prev, cur) => {
      prev.size += cur.size;
      prev.minified += cur.minified;
      prev.gzip += cur.gzip;
      prev.minifiedGzip += cur.minifiedGzip;
      return prev;
    },
    {
      entry: 'Total',
      size: 0,
      minified: 0,
      gzip: 0,
      minifiedGzip: 0,
    },
  ),
);

console.table(
  arr
    .sort((a, b) => a.minified - b.minified)
    .map((val) => ({
      Entry: val.entry,
      Size: toByte(val.size),
      Minified: toByte(val.minified),
      GZIP: toByte(val.gzip),
      'Minified GZIP': toByte(val.minifiedGzip),
    })),
);

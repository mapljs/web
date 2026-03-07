import { minify } from 'oxc-minify';
import { LIB } from './utils.ts';

const toByte = (num: number) => (num >= 1e3 ? +(num / 1e3).toFixed(2) + 'KB' : num + 'B');

const arr = await Promise.all(
  [...new Bun.Glob('**/*.js').scanSync(LIB)].map(async (path) => {
    const file = Bun.file(LIB + '/' + path);
    const code = await file.text();
    const minfiedCode = minify(path, code).code!;

    return {
      entry: path,
      size: file.size,
      minified: Buffer.from(minfiedCode).byteLength,
      gzip: Bun.gzipSync(code).byteLength,
      minifiedGzip: Bun.gzipSync(minfiedCode).byteLength,
    };
  }),
);
arr.push(
  arr.reduce((prev, cur) => {
    prev.size += cur.size;
    prev.minified += cur.minified;
    prev.gzip += cur.gzip;
    prev.minifiedGzip += cur.minifiedGzip
    return prev;
  }, {
    entry: 'Total',
    size: 0,
    minified: 0,
    gzip: 0,
    minifiedGzip: 0,
  })
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

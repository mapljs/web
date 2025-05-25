import { group, run, bench } from 'mitata';

import { hrtime } from 'node:process';
import { basename, relative } from 'node:path';

import frameworks from './.out/index.js';
import data from './setup/data.json';

// Log startup time
const req = new Request('http://127.0.0.1');
const importedFetches: { fetch: (req: Request) => any }[] = await Promise.all(
  frameworks.map(async (path: string) => {
    let start = hrtime.bigint();
    const res = (await import(path)).default;
    await res.fetch(req);
    start = hrtime.bigint() - start;

    console.log(
      relative('.', path),
      'took',
      start / 1000n,
      'us',
      '-',
      start / 1000000n,
      'ms',
    );
    return res;
  }),
);

group(() => {
  for (let i = 0; i < frameworks.length; i++) {
    bench(basename(frameworks[i], '.js'), function* () {});
  }
});

run();

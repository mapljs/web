import { group, run, bench } from 'mitata';

import { hrtime } from 'node:process';
import { relative } from 'node:path';

import frameworks from './.out/index.js';
import data from './setup/data.json';

// Log startup time
const importWithLog = async (path: string) => {
  let start = hrtime.bigint();

  const res = (await import(path)).default;
  await res.fetch(new Request('http://127.0.0.1'));

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
};

(async () => {
  const importedFetch: { fetch: (req: Request) => any }[] = await Promise.all(
    frameworks.map(importWithLog),
  );
})();

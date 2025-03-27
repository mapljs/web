import { builtSchema, requests } from './schema';
import cases from './src';

import type { Test } from './utils';
import { run, bench, do_not_optimize, summary } from 'mitata';
import * as latch from 'ciorent/latch';

const lat = latch.init();

summary(async () => {
  for (const caseGroup of cases) {
    checkCase: for (const testCase of Object.values(caseGroup) as Test[]) {
      const { fn: obj, name } = testCase;

      for (const scheme of builtSchema) {
        const res = obj.fetch(scheme.req) as Response;
        const txt = await res.text().catch(() => { });

        if (txt !== scheme.expected) {
          console.error('Skipping', name);
          console.log('Failed test:', scheme.method, scheme.path);
          console.log('Expected:', scheme.expected);
          console.log('Found:', txt);
          console.log('Request:', scheme.req);
          console.log('Request body:', scheme.body);
          continue checkCase;
        }
      }

      console.log(name, obj.fetch.toString());

      bench(name, function* () {
        yield {
          [0]() {
            return requests;
          },
          bench(arr: typeof requests) {
            for (let i = 0; i < arr.length; i++)
              do_not_optimize(obj.fetch(arr[i]));
          }
        }
      });
    }
  }

  latch.open(lat);
});

await latch.pause(lat);
await run();

A compiled web framework for all runtimes.

```ts
import { router, handle, layer } from '@mapl/web';
import { compileToHandler } from '@mapl/web/compiler/jit';

const api = router([], [
  handle.get('/', () => 'Hi')
]);

const app = router(
  // Middlewares
  [ layer.attach('id', () => performance.now()) ],

  // Routes
  [ handle.get('/path', (c) => c.id) ],

  // Subrouters
  { '/api': api }
);

export default {
  fetch: await compileToHandler(app)
};
```

## AOT compilation (experimental)
Build `@mapl/web` to improve startup time.

Setup:
```ts
// main.ts
import { handle, layer, router } from '@mapl/web';

export default router(
  [
    layer.tap((c) => {
      console.log(c.req);
    }),
    layer.attach('id', () => performance.now()),
  ],
  [handle.any('/path', (c) => c.id)],
  {
    '/api': router(
      [layer.parse('body', async (c) => c.req.text())],
      [handle.post('/body', (c) => c.body)],
    ),
  },
);

// build.ts
import app from './main.ts';
import { compileToDependency } from '@mapl/web/compiler/jit';
import { evaluateToString } from "runtime-compiler/jit";

import { rolldown } from "rolldown";
import terser from '@rollup/plugin-terser';

import { writeFileSync } from "node:fs";

// Output file
const OUTPUT = "./index.js";
const HANDLER = compileToDependency(app);

writeFileSync(
  OUTPUT,
  `import 'runtime-compiler/hydrate-loader';

import app from './main.js';
import hydrateRouter from '@mapl/web/compiler/aot';
hydrateRouter(app);

import { hydrate } from 'runtime-compiler/hydrate';
(${evaluateToString()})(...hydrate());

import { getDependency } from 'runtime-compiler';
export default {
  fetch: getDependency(${HANDLER})
};`,
);
const input = await rolldown({
  input: ENTRY,
  plugins: [
    terser({
      module: true,
      mangle: false,
      compress: {
        // passes should be at least 2
        passes: 3,
      },
    }),
  ],
});
await input.write({
  file: ENTRY,
  inlineDynamicImports: true,
});
```
As of rn only `terser` can DCE `@mapl/web` well.

### Hydration
```ts
import { isHydrating } from 'runtime-compiler/config';

// false while building the output string
// true while only building dependencies
// Use this to for minifiedrs to eliminate unused code path in final output
isHydrating;
```

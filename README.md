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
  [
    handle.get('/path', (c) => c.id, {
      // Response wrapper
      type: handle.text
    })
  ],

  // Subrouters
  { '/api': api }
);

export default {
  fetch: await compileToHandler(app)
};
```

## AOT compilation (experimental)
Build `@mapl/web` to improve startup time.

### Rolldown
Dependencies: `rolldown`, `@rollup/plugin-terser`.
```ts
// main.ts
import { handle, layer, router } from '@mapl/web';

// Main app
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

// Additional options
export const serveOptions = {};

// build.ts
import terser from '@rollup/plugin-terser';
import build from '@mapl/web/build/rolldown';

build({
  input: INPUT,
  output: {
    file: OUTPUT,
  },
  finalizeOptions: {
    plugins: [
      terser({
        compress: {
          // passes should be >= 2
          passes: 3,
        },
        mangle: false,
      }),
    ],
  },
});
```
As of rn only `terser` can DCE `@mapl/web` patterns.

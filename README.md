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
    handle.get('/path', (c) => '' + c.id, {
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
Try it out using:
```sh
npm install -g degit
degit github:mapljs/web/examples/generic
# or with Bun
degit github:mapljs/web/examples/bun
```

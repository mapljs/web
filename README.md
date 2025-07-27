A compiled web framework for all runtimes.

```ts
import { router, handle, layer, compile } from '@mapl/web';

const api = router.init([], [
  handle.get('/', () => 'Hi')
]);

const app = router.init(
  // Middlewares
  [ layer.attach('id', () => performance.now()) ],

  // Routes
  [ handle.get('/path', (c) => c.id) ],

  // Subrouters
  { '/api': api }
);

export default {
  fetch: compile(app)
};
```

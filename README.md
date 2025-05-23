# `@mapl/web`
A compiled web framework for all runtimes.

```ts
import { router, handler, layer, compile } from '@mapl/web';

const api = router.init([], [
  handler.get('/', () => 'Hi')
]);

const app = router.init(
  [ layer.attach('id', () => performance.now()) ],
  [ handler.get('/path', (c) => c.id) ],
  { '/api': api }
);

export default {
  fetch: router.compile(app)
};
```

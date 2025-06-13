A compiled web framework for all runtimes.

```ts
import { router, handle, layer, compile } from '@mapl/web';

const api = router.init(
  [],
  [ handle.get('/', () => 'Hi') ]
);

const app = router.init(
  [ layer.attach('id', () => performance.now()) ],
  [ handle.get('/path', (c) => c.id) ],
  { '/api': api }
);

export default {
  fetch: router.compile(app)
};
```

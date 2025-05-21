# `@mapl/web`
A compiled web framework for all runtimes.

```ts
import { router, layer, compile } from '@mapl/web';

const app = router.init([
  layer.attach('id', () => performance.now())
], [
  router.on('GET', '/path', (c) => c.id)
]);

export default {
  fetch: compile(app)
};
```

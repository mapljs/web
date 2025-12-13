# `@mapl/web`
A low level, fast and type-safe framework.

```ts
import { inject, router, send } from '@mapl/web';
import { compiler, request } from '@mapl/web/generic';

const app = router.init(
  [],
  [
    router.get(
      '/',
      send.raw((c) => {
        c.status = 418;
        return 'Hi';
      }),
    ),
    router.post(
      '/body',
      send.json(
        inject([request], async (req) => req.json())
      ),
    ),
  ],
);

export default {
  fetch: compiler.buildSync(app)(),
};
```

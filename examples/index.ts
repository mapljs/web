import { inject, layer, route, router, send } from '@mapl/web';
import { compiler, request } from '@mapl/web/generic';
import { err } from '@safe-std/error';

const app = router(
  [
    layer.tap(() => {
      console.log('time:', performance.now());
    }),
    layer.validate(
      () => Math.random() < 0.5 && err('random'),
      send.raw((e, c) => {
        c.status = 418;
        return e.payload;
      })
    )
  ],
  [
    route.get(
      '/',
      send.raw(() => 'Hi'),
    ),
    route.post(
      '/body',
      send.json(inject([request], async (req) => req.json())),
    ),
  ],
);

const fn = compiler.build(app);
console.log(fn.toString());

export default {
  fetch: fn(),
};

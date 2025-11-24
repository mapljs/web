import { inject, layer, parser, route, router, send } from '@mapl/web';
import { compiler, request } from '@mapl/web/generic';
import { err } from '@safe-std/error';

const randomParser = parser.init(
  () => (Math.random() < 0.01 ? err('random') : 'passed'),
  send.raw((e, c) => {
    c.status = 418;
    return e.payload;
  }),
);

const app = router(
  [
    layer.tap(() => {
      console.log('time:', performance.now());
    }),
    randomParser,
  ],
  [
    route.get(
      '/',
      send.raw(
        inject([parser.result(randomParser)], (val) => val)
      ),
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

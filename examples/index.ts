import { inject, route, router, send } from '@mapl/web';
import { compiler, request } from '@mapl/web/generic';

const app = router(
  [],
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

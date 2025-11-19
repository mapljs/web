import { inject, route, router, send } from '../lib/index.js';
import { compiler, request } from '../lib/generic/index.js';

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

export default {
  fetch: compiler.buildSync(app)(),
};

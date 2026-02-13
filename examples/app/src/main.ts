import { layer, router, send } from '@mapl/web';
import { request } from '@mapl/web/generic';
import api from './api';

export default router.init(
  [
    layer.tap(() => {
      console.log('time:', performance.now());
    }),
  ],
  [
    router.get(
      '/user/*',
      send.raw((id) => id),
    ),
    router.get(
      '/user/*/dashboard',
      send.raw((id) => id),
    ),
    router.get(
      '/search/**',
      send.raw((id) => id),
    ),
    router.post(
      '/body',
      send.json(async (req) => req.json(), request),
    ),
  ],
  router.mount('/api', api)
);

import { router, layer, handler } from '@mapl/web';

const subrouter = router.init([], [handler.on('GET', '/', () => 'Hello')]);
const app = router.init(
  // Middlewares
  [
    layer.tap((c) => {
      console.log(c.req);
    }),
    layer.attach('id', () => performance.now()),
  ],

  // Route handlers
  [
    handler.get('/path', (c) => c.id),
    handler.post('/body', async (c) => c.req.text()),
  ],

  // Subrouters
  {
    '/api': subrouter,
  },
);

export default {
  fetch: router.compile(app),
};

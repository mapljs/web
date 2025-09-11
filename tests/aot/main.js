import { handle, layer, router } from '../../lib/index.js';

export default router(
  [
    layer.tap((c) => {
      console.log(c.req);
    }),
    layer.attach('id', () => performance.now()),
  ],
  [handle.any('/path', (c) => c.id)],
  {
    '/api': router(
      [layer.attach('body', async (c) => c.req.text())],
      [handle.post('/body', (c) => c.body)],
    ),
  },
);

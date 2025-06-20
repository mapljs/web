import { router, layer, handle, compile } from '@mapl/web';

const subrouter = router([], [handle.get('/', () => 'Hello')]);
const app = router(
  [
    layer.tap((c) => {
      console.log(c.req);
    }),
    layer.attach('id', () => performance.now()),
  ],
  [
    handle.any('/path', (c) => c.id),
    handle.post('/body', async (c) => c.req.text()),
  ],
  { '/api': subrouter },
);

console.log(compile(app).toString());

export default {
  fetch: compile(app),
};

import { compile, handle, layer, router, st } from '@mapl/web';

const app = handle.error(
  router(
    [
      layer.validate(() => {
        if (Math.random() < 0.5) return st.err('An error occured');
      }),
    ],
    [handle.get('/', () => 'Hi')],
  ),
  (err, c) => {
    c.status = 400;
    return st.payload(err);
  },
);

export default {
  fetch: compile(app),
};

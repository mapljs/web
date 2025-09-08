import { handle, layer, router, cors } from '@mapl/web';

import { compileToString } from '@mapl/web/compiler/jit';

import * as st from '@safe-std/error';

const OUTDIR = import.meta.dir + '/out/';
const write = async (name: string, app: () => any): Promise<void> => {
  try {
    await Bun.write(
      OUTDIR + name.toLowerCase().replaceAll(' ', '-') + '.js',
      compileToString(await app()),
    );
  } catch (e) {
    console.error(e);
  }
};

write('Basic', () =>
  router(
    [
      layer.tap((c) => {
        console.log(c.req);
      }),
      layer.attach('id', () => performance.now()),
    ],
    [handle.any('/path', (c) => c.id)],
    {
      '/api': router(
        [layer.parse('body', async (c) => c.req.text())],
        [handle.post('/body', (c) => c.body)],
      ),
    },
  ),
);

write('CORS', () =>
  router([cors.init('*', [cors.maxAge(96000)])], [handle.get('/', () => 'Hi')]),
);

write('Error', () =>
  handle.error(
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
  ),
);

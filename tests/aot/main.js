import { handle, layer, router } from '../../lib/index.js';
import {
  localDependency,
  injectLocalDependency,
} from '../../lib/compiler/index.js';

const logID = injectLocalDependency(
  '() => console.log("ID:", +Math.random().toFixed(2))',
);

export default router(
  [
    layer.tap((c) => {
      console.log(c.req);
      localDependency(logID)();
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

import { isHydrating } from 'runtime-compiler/config';
import { handle, layer, router, headers } from '../../lib/index.js';
import {
  injectDependency,
  getDependency,
  markDependency,
} from 'runtime-compiler';

const logID = isHydrating
  ? markDependency()
  : injectDependency('() => console.log("ID:", +Math.random().toFixed(2))');
const logID2 = isHydrating
  ? markDependency()
  : injectDependency('() => console.log("ID:", +Math.random().toFixed(2))');

export default router(
  [
    layer.tap((c) => {
      console.log(c.req);
      getDependency(logID)();
      getDependency(logID2)();
    }),
    layer.attach('id', () => performance.now()),
    headers({
      'x-powered-by': '@mapl/web',
    }),
  ],
  [handle.any('/path', (c) => c.id)],
  {
    '/api': router(
      [layer.attach('body', async (c) => c.req.text())],
      [handle.post('/body', (c) => c.body)],
    ),
  },
);

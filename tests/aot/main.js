import { isHydrating } from 'runtime-compiler/config';
import { handle, layer, router } from '../../lib/index.js';
import { injectDependency, getDependency } from 'runtime-compiler';

console.log(isHydrating);

const logID = injectDependency(
  '() => console.log("ID:", +Math.random().toFixed(2))',
);
const logID2 = injectDependency(
  '() => console.log("ID:", +Math.random().toFixed(2))',
);

export default router(
  [
    layer.tap((c) => {
      console.log(c.req);
      getDependency(logID)();
      getDependency(logID2)();
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

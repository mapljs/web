// @ts-check
import { isHydrating } from 'runtime-compiler/config';
import { handle, layer, router, headers } from '../../lib/index.js';
import {
  injectDependency,
  getDependency,
  exportDependency,
  markExported,
} from 'runtime-compiler';

const logRequest = isHydrating
  ? markExported()
  : exportDependency(injectDependency('(r) => console.log(r.method, r.url)'));

export default router(
  [
    isHydrating
      ? layer.noOpMacro
      : layer.macro(() => {
          const fn = injectDependency(
            '() => console.log("ID:", +Math.random().toFixed(2))',
          );
          return fn + '();';
        }),
    layer.tap((c) => getDependency(logRequest)(c.req)),
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

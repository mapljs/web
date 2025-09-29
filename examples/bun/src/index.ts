import { cors, handle, staticHeaders } from '@mapl/web';
import { router } from '@mapl/web/bun';
import api from './api.ts';

export default router(
  [
    cors.init('*', [cors.maxAge(60000)]),
    staticHeaders({
      'x-powered-by': '@mapl/web',
    }),
  ],
  [
    handle.any('/path', () => '' + performance.now(), {
      type: handle.text,
    }),
  ],
  {
    '/api': api,
  },
);

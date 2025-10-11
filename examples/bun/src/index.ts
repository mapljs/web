import { cors, handle, staticHeaders } from '@mapl/web';
import { router } from '@mapl/web/bun';
import api from './api.ts';

export default router(
  [
    cors.init(['http://example.com', 'http://localhost:3000'], [cors.maxAge(60000)]),
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

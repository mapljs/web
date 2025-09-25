import { router, handle, layer } from '@mapl/web';
import api from './api.ts';

export default router(
  // Middlewares
  [ layer.attach('id', () => performance.now()) ],

  // Routes
  [
    handle.get('/path', (c) => '' + c.id, {
      // Response wrapper
      type: handle.text
    })
  ],

  // Subrouters
  { '/api': api }
);

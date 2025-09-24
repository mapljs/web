import { router, handle, layer } from '@mapl/web_dev';
import api from './api.js';

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

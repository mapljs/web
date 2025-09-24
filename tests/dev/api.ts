import { router, handle } from '@mapl/web_dev';

export default router([], [
  handle.get('/', () => 'Hi', {
    type: handle.text
  })
]);

import { router, handle } from '@mapl/web';

export default router([], [
  handle.get('/', () => 'Hi', {
    type: handle.text
  })
]);

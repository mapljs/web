import { router, layer, compile } from '../../lib/index.js';

const app = router.init(
  [layer.attach('id', () => performance.now())],
  [router.on('GET', '/path', (c) => c.id)]
);

export default {
  fetch: compile(app)
}

import { compile, cors, handle, router } from '../../lib/index.js';
import { now } from 'mitata/src/lib.mjs';

const ROUTES = 10000;
const TIME = ['ns', 'us', 'ms', 's'];

const format = (n: number) => {
  let i = 0;
  for (; n >= 1000 && i < TIME.length; i++)
    n /= 1000;
  return +n.toFixed(2) + TIME[i];
}

{
  const app = router(
    [cors.init('*')],
    new Array(ROUTES).fill(0).map((_, i) =>
      i % 3 === 0
        ? handle.get(`/${i}`, () => '' + i)
        : i % 3 === 1
          ? handle.any(`/${i}`, (c) => c.req.method + ' ' + i)
          : handle.post(`/${i}`, async (c) => c.req.text())
    )
  );

  let start = now();
  const fetch = compile(app);
  fetch(new Request('http://127.0.0.1/0'));
  start = now() - start;

  console.log(`Build ${ROUTES} routes:`, format(start));
  console.log('Fetch function size:', fetch.toString().length);
}

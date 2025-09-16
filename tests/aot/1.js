import 'runtime-compiler/hydrate-loader';

import app from './main.js';
import hydrateRouter from '../../lib/compiler/aot.js';
hydrateRouter(app);

import { hydrate } from 'runtime-compiler/hydrate';
((_, _1, _2, _3, _4, _5, _6, _7) =>
  _.push(
    () => console.log('ID:', +Math.random().toFixed(2)),
    () => console.log('ID:', +Math.random().toFixed(2)),
    (() => {
      var t = ['text/html', 'application/json'].map((c) => ['Content-Type', c]),
        [h, j] = t,
        [oh, oj] = t.map((c) => ({ headers: [c] })),
        [n, b] = [404, 400].map((s) => new Response(null, { status: s }));
      return (r) => {
        let u = r.url,
          s = u.indexOf('/', 12) + 1,
          e = u.indexOf('?', s),
          p = e === -1 ? u.slice(s) : u.slice(s, e);
        if (r.method === 'POST') {
          if (p === 'api') {
            let hd = [],
              c = { status: 200, req: r, headers: hd };
            _2(c);
            c.id = _3();
            hd.push(..._4);
            return (async () => {
              c.body = await _6(c);
              return new Response(_7(c), c);
            })();
          }
        }
        if (p === 'path') {
          let hd = [],
            c = { status: 200, req: r, headers: hd };
          _2(c);
          c.id = _3();
          hd.push(..._4);
          return new Response(_5(c), c);
        }
        return n;
      };
    })(),
  ))(...hydrate());

import { getDependency } from 'runtime-compiler';
export default {
  fetch: getDependency(2),
};

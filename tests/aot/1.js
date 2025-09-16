import 'runtime-compiler/hydrate-loader';

import app from './main.js';
import hydrateRouter from '../../lib/compiler/aot.js';
hydrateRouter(app);

import { hydrate } from 'runtime-compiler/hydrate';
((_, _1, _2, _3, _4, _5, _6) =>
  _.push(
    () => console.log('ID:', +Math.random().toFixed(2)),
    () => console.log('ID:', +Math.random().toFixed(2)),
    (() => {
      var t = ['text/html', 'application/json'].map((c) => ['Content-Type', c]),
        [mwh, mwj] = t,
        [mwoh, mwoj] = t.map((c) => ({ headers: [c] })),
        [mwn, mwb] = [404, 400].map((s) => new Response(null, { status: s })),
        mwc = (r) => ({ status: 200, req: r, headers: [] });
      return (r) => {
        let u = r.url,
          s = u.indexOf('/', 12) + 1,
          e = u.indexOf('?', s),
          p = e === -1 ? u.slice(s) : u.slice(s, e);
        if (r.method === 'POST') {
          if (p === 'api') {
            let c = mwc(r);
            _2(c);
            c.id = _3();
            return (async () => {
              c.body = await _5(c);
              return new Response(_6(c), c);
            })();
          }
        }
        if (p === 'path') {
          let c = mwc(r);
          _2(c);
          c.id = _3();
          return new Response(_4(c), c);
        }
        return mwn;
      };
    })(),
  ))(...hydrate());

import { getDependency } from 'runtime-compiler';
export default {
  fetch: getDependency(2),
};

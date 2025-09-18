import 'runtime-compiler/hydrate-loader';

import app from './main.js';
import hydrateRouter from '../../lib/compiler/aot.js';
hydrateRouter(app);

import { hydrate } from 'runtime-compiler/hydrate';
((_, _1, _2, _3, _4, _5, _6) => {
  var __0 = (r) => console.log(r.method, r.url),
    __1 = ['access-control-allow-origin', '*'],
    __2 = ['access-control-max-age', '60000'],
    __3 = (r, h) => {
      h.push(__1);
      r.method === 'OPTIONS' && h.push(__2);
    },
    __4 = ['x-powered-by', '@mapl/web'],
    __5 = (() => {
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
            __3(r, hd);
            _2(c);
            c.id = _3();
            hd.push(__4);
            return (async () => {
              c.body = await _5(c);
              return new Response(_6(c), c);
            })();
          }
        }
        if (p === 'path') {
          let hd = [],
            c = { status: 200, req: r, headers: hd };
          __3(r, hd);
          _2(c);
          c.id = _3();
          hd.push(__4);
          return new Response(_4(c), c);
        }
        return n;
      };
    })();
  _.push(__0, __5);
})(...hydrate());

import { getDependency } from 'runtime-compiler';
export default {
  fetch: getDependency(1),
};

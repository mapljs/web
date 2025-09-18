import 'runtime-compiler/hydrate-loader';

import app from './main.js';
import hydrateRouter from '../../lib/compiler/aot.js';
hydrateRouter(app);

import { hydrate } from 'runtime-compiler/hydrate';
((_, _1, _2, _3, _4) => {
  var __0 = ['access-control-allow-origin', '*'],
    __1 = ['access-control-max-age', '60000'],
    __2 = (r, h) => {
      h.push(__0);
      r.method === 'OPTIONS' && h.push(__1);
    },
    __3 = ['x-powered-by', '@mapl/web'],
    __4 = (() => {
      return (o) =>
        o !== null &&
        typeof o === 'object' &&
        typeof o.name === 'string' &&
        typeof o.pwd === 'string';
    })(),
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
            __2(r, hd);
            hd.push(__3);
            return (async () => {
              let t = await r.json().catch(() => {});
              if (__4(t)) {
                t = _2;
                return b;
              }
              c.body = t;
              hd.push(j);
              return new Response(JSON.stringify(_4(c)), c);
            })();
          }
        }
        if (p === 'path') {
          let hd = [],
            c = { status: 200, req: r, headers: hd };
          __2(r, hd);
          hd.push(__3);
          return new Response(_3(c), c);
        }
        return n;
      };
    })();
  _.push(__5);
})(...hydrate());

import { getDependency } from 'runtime-compiler';
export default {
  fetch: getDependency(0),
};

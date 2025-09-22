import 'runtime-compiler/hydrate-loader';

import app from './main.js';
import hydrateRouter from '../../lib/compiler/aot.js';
hydrateRouter(app);

import { hydrate } from 'runtime-compiler/hydrate';
((_, _1, _2, _3, __1, __2) => {
  var $0 = ['access-control-allow-origin', '*'],
    $1 = ['access-control-max-age', '60000'],
    $2 = (r, h) => {
      h.push($0);
      r.method === 'OPTIONS' && h.push($1);
    },
    $3 = ['x-powered-by', '@mapl/web'],
    $4 = (() => {
      return (o) =>
        o !== null &&
        typeof o === 'object' &&
        typeof o.name === 'string' &&
        typeof o.pwd === 'string';
    })(),
    $5 = ['content-type', 'application/json'],
    $6 = (r) => {
      let u = r.url,
        s = u.indexOf('/', 12) + 1,
        e = u.indexOf('?', s),
        p = e === -1 ? u.slice(s) : u.slice(s, e);
      if (r.method === 'POST') {
        if (p === 'api') {
          let h = [],
            c = { status: 200, req: r, headers: h };
          $2(r, h);
          h.push($3);
          return (async () => {
            let t = await r.json().catch(() => {});
            if ($4(t)) {
              return new Response(_2(__2), c);
            }
            c.body = t;
            h.push($5);
            return new Response(JSON.stringify(_3(c)), c);
          })();
        }
      }
      if (p === 'path') {
        let h = [],
          c = { status: 200, req: r, headers: h };
        $2(r, h);
        h.push($3);
        return new Response(_1(), c);
      }
      return $0;
    };
  _.push($6);
})(...hydrate());

import { getDependency } from 'runtime-compiler';
export default {
  fetch: getDependency(0),
};

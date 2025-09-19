import 'runtime-compiler/hydrate-loader';

import app from './main.js';
import hydrateRouter from '../../lib/compiler/aot.js';
hydrateRouter(app);

import { hydrate } from 'runtime-compiler/hydrate';
((_, _1, _2, _3, _4) => {
  var $0 = ['content-type', 'application/json'],
    $1 = { headers: [$0] },
    $2 = ['content-type', 'text/html'],
    $3 = { headers: [$2] },
    $4 = new Response(null, { status: 404 }),
    $5 = new Response(null, { status: 400 }),
    $6 = ['access-control-allow-origin', '*'],
    $7 = ['access-control-max-age', '60000'],
    $8 = (r, h) => {
      h.push($6);
      r.method === 'OPTIONS' && h.push($7);
    },
    $9 = ['x-powered-by', '@mapl/web'],
    $10 = (() => {
      return (o) =>
        o !== null &&
        typeof o === 'object' &&
        typeof o.name === 'string' &&
        typeof o.pwd === 'string';
    })(),
    $11 = ((r) => {
      let u = r.url,
        s = u.indexOf('/', 12) + 1,
        e = u.indexOf('?', s),
        p = e === -1 ? u.slice(s) : u.slice(s, e);
      if (r.method === 'POST') {
        if (p === 'api') {
          let h = [],
            c = { status: 200, req: r, headers: h };
          $8(r, h);
          h.push($9);
          return (async () => {
            let t = await r.json().catch(() => {});
            if ($10(t)) {
              return $5;
            }
            c.body = t;
            h.push($0);
            return new Response(JSON.stringify(_4(c)), c);
          })();
        }
      }
      if (p === 'path') {
        let h = [],
          c = { status: 200, req: r, headers: h };
        $8(r, h);
        h.push($9);
        return new Response(_3(), c);
      }
      return $4;
    })();
  _.push($11);
})(...hydrate());

import { getDependency } from 'runtime-compiler';
export default {
  fetch: getDependency(0),
};

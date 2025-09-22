import 'runtime-compiler/hydrate-loader';

import app from './main.js';
import hydrateRouter from '../../lib/compiler/bun/aot.js';
hydrateRouter(app);

import { hydrate } from 'runtime-compiler/hydrate';
((_, _1, _2) => {
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
    $5 = (r, s) => {
      let h = [],
        c = { status: 200, req: r, server: s, headers: h };
      $2(r, h);
      h.push($3);
      return new Response(_1(), c);
    },
    $6 = {
      '/path': (r, s) => $5(r, s),
      '/api': {
        POST: (r, s) => {
          let h = [],
            c = { status: 200, req: r, server: s, headers: h };
          $2(r, h);
          h.push($3);
          return (async () => {
            let t = await r.json().catch(() => {});
            if ($4(t)) {
              return $5;
            }
            c.body = t;
            h.push($0);
            return new Response(JSON.stringify(_2(c)), c);
          })();
        },
      },
    };
  _.push($6);
})(...hydrate());

import { getDependency } from 'runtime-compiler';
export default {
  routes: getDependency(0),
};

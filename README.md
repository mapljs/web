A compiled web framework for all runtimes.

```ts
import { router, handle, layer } from '@mapl/web';
import { compileToHandler } from '@mapl/web/compiler/jit';

const api = router.init([], [
  handle.get('/', () => 'Hi')
]);

const app = router.init(
  // Middlewares
  [ layer.attach('id', () => performance.now()) ],

  // Routes
  [ handle.get('/path', (c) => c.id) ],

  // Subrouters
  { '/api': api }
);

export default {
  fetch: compileToHandler(app)
};
```

## AOT compilation (experimental)
Build `@mapl/web` to improve startup time.

Setup:
```ts
// main.ts
import { handle, layer, router } from '@mapl/web';

export default router(
  [
    layer.tap((c) => {
      console.log(c.req);
    }),
    layer.attach('id', () => performance.now()),
  ],
  [handle.any('/path', (c) => c.id)],
  {
    '/api': router(
      [layer.parse('body', async (c) => c.req.text())],
      [handle.post('/body', (c) => c.body)],
    ),
  },
);

// build.ts
import app from './main.ts';
import { compileToString } from '@mapl/web/compiler/jit';

import { rolldown } from 'rolldown';
import { minifySync } from '@swc/core';
import { writeFileSync, readFileSync } from 'node:fs';

const ENTRY = '/path/to/output.js';

writeFileSync(
  ENTRY,
  `
    import app from '${import.meta.resolve('./main.ts')}';
    import hydrate from '@mapl/web/compiler/aot';

    // Compatible with Bun, Deno, Cloudflare, ...
    export default {
      fetch: (${compileToString(app)})(...hydrate(app))
    };
  `
);
const input = await rolldown({
  input: ENTRY,
  transform: {
    typescript: {
      rewriteImportExtensions: true,
    },
  },
});
const output = await input.generate();
const code = minifySync(output.output[0].code, { module: true }).code;
writeFileSync(ENTRY, code);
```

Example output (formatted):
```js
// router()
var e = (e, t, l) => [e, t, , l];
// handle.route()
let t = (e, t) => [1, t, e],
  l = { type: null },
  n = (e, t, n, ...r) => [
    e,
    t,
    n,
    0 === r.length ? l : Object.assign({ type: null }, ...r),
  ];
var r = e(
  [
    // inlined layer.tap()
    [
      0,
      (e) => {
        console.log(e.req);
      },
    ],
    // layer.attach()
    t("id", () => performance.now()),
  ],
  // handle.any()
  [((...e) => n("", ...e))("/path", (e) => e.id)],
  {
    "/api": e(
      // layer.attach()
      [t("body", async (e) => e.req.text())],
      // handle.post()
      [((...e) => n("POST", ...e))("/body", (e) => e.body)],
    ),
  },
);
// hydration code
let a = (e, t) => {
    let l = e + t;
    return /.\/$/.test(l) ? e : l;
  },
  s = (async () => {}).constructor,
  o = [, , , , ,],
  u = (e) => (e[3] ??= o[4](e[2][0], e[2][1], e)),
  i = (e) => {
    null != e[2] && (e[3] = null);
  },
  p = (e) => (e[1] ? "" : ((e[1] = !0), i(e), o[2])),
  c = (e) => (e[0] ? "" : ((e[0] = !0), i(e), "return (async()=>{")),
  d = (e) => (e[4] ? "t" : ((e[4] = !0), "let t")),
  f = (e, t, l) => {
    null != e[2] && ((t[2] = e[2]), (t[3] = null));
    for (let l = 0, n = e[0]; l < n.length; l++) {
      let e = n[l],
        r = e[1],
        a = e[0];
      -1 === a
        ? r(t)
        : (o[1].push(r),
          r.length > 0 && p(t),
          r instanceof s && c(t),
          1 === a
            ? p(t)
            : 2 === a
              ? (d(t), u(t))
              : 3 === a && (d(t), u(t), p(t)));
    }
    for (let n = 0, r = e[1]; n < r.length; n++) {
      let e = r[n],
        s = a(l, e[1]);
      o[3](e[2], e[3], s, t);
    }
    let n = e[3];
    if (null != n) for (let e in n) f(n[e], t.slice(), "/" === e ? l : l + e);
  },
  y = Symbol.for("@safe-std/error");
var h = {
  // built content
  fetch: ((e, t, l, n, r, a, s) => {
    var o = ["text/html", "application/json"].map((e) => ["Content-Type", e]),
      [u, i] = o,
      [p, c] = o.map((e) => ({ headers: [e] })),
      [d, f] = [404, 400].map((e) => new Response(null, { status: e }));
    return (e) => {
      let o = e.url,
        u = o.indexOf("/", 12) + 1,
        i = o.indexOf("?", u),
        p = -1 === i ? o.slice(u) : o.slice(u, i);
      if ("POST" === e.method && "api/body" === p) {
        let r = t(e);
        return (
          l(r),
          (r.id = n()),
          (async () => ((r.body = await a(r)), new Response(s(r), r)))()
        );
      }
      if ("path" === p) {
        let a = t(e);
        return (l(a), (a.id = n()), new Response(r(a), a));
      }
      return d;
    };
  })(
    ...((o[0] = {}),
    (o[1] = []),
    (o[2] = "let c=mwc(r);"),
    (o[3] = (e) => (o[1].push(e), "")),
    (o[4] = (e) => (o[1].push(e), "")),
    f(r, [!1, !1, , "return mwb", !1], ""),

    // inject dependencies
    [
      (e) => Array.isArray(e) && e[0] === y,
      (e) => ({ status: 200, req: e, headers: [] }),
    ].concat(o[1])),
  ),
};
export { h as default };
```

### Hydration
```ts
import { isHydrating } from '@mapl/web/compiler/config';

// false while building the output string
// true while only building dependencies
// Use this to for minifiedrs to eliminate unused code path in final output
isHydrating();
```

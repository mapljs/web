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
import { injectCompiledHandler } from '@mapl/web/compiler/jit';
import { evaluateToString } from "runtime-compiler/jit";

import { rolldown } from "rolldown";
import terser from '@rollup/plugin-terser';

import { writeFileSync } from "node:fs";

// Output file
const OUTPUT = "./index.js";
const HANDLER = injectCompiledHandler(app);

writeFileSync(
  OUTPUT,
  `import 'runtime-compiler/hydrate-loader';

import app from './main.js';
import hydrateRouter from '@mapl/web/compiler/aot';
hydrateRouter(app);

import { hydrate } from 'runtime-compiler/hydrate';
(${evaluateToString()})(...hydrate());

import { getDependency } from 'runtime-compiler';
export default {
  fetch: getDependency(${HANDLER})
};`,
);
const input = await rolldown({
  input: ENTRY,
  plugins: [
    terser({
      module: true,
      mangle: false,
      compress: {
        // passes should be at least 2
        passes: 3,
      },
    }),
  ],
});
const output = await input.write({
  file: ENTRY,
  inlineDynamicImports: true,
});
```

Example output:
```js
let isHydrating = !1;
isHydrating = !0;
var core_default = (middlewares, handlers, children) => [
  middlewares,
  handlers,
  ,
  children,
];
let attach = (prop, f) => [1, f, prop],
  noType = { type: null },
  mergeData = (...dat) =>
    0 === dat.length ? noType : Object.assign({ type: null }, ...dat),
  compiledDependencies = [],
  externalDependencies = [],
  getDependency = (c) => compiledDependencies[c],
  injectExternalDependency = (e) => '_' + externalDependencies.push(e);
var f,
  handler,
  main_default = core_default(
    [
      ((f = (c) => {
        console.log(c.req), getDependency(logID)(), getDependency(logID2)();
      }),
      [0, f]),
      attach('id', () => performance.now()),
    ],
    [((handler = (c) => c.id), ['', '/path', handler, mergeData()])],
    {
      '/api': core_default(
        [attach('body', async (c) => c.req.text())],
        [['POST', '/body', (c) => c.body, mergeData()]],
      ),
    },
  );
let hooks,
  _ = Symbol.for('@safe-std/error'),
  AsyncFunction =
    (injectExternalDependency((u) => Array.isArray(u) && u[0] === _),
    (async () => {}).constructor),
  compileErrorHandler = (scope) =>
    (scope[3] ??= hooks.compileErrorHandler(scope[2][0], scope[2][1], scope)),
  clearErrorHandler = (scope) => {
    null != scope[2] && (scope[3] = null);
  },
  createContext = (scope) => (
    scope[1] || ((scope[1] = !0), clearErrorHandler(scope)), ''
  ),
  createAsyncScope = (scope) => (
    scope[0] || ((scope[0] = !0), clearErrorHandler(scope)), ''
  ),
  setTmp = (scope) => ((scope[4] = !0), ''),
  hydrateDependency = (group, scope, prefix) => {
    null != group[2] && ((scope[2] = group[2]), (scope[3] = null));
    for (let i = 0, middlewares = group[0]; i < middlewares.length; i++) {
      let middleware = middlewares[i],
        fn = middleware[1],
        id = middleware[0];
      -1 === id
        ? fn(scope)
        : (injectExternalDependency(fn),
          fn.length > 0 && createContext(scope),
          fn instanceof AsyncFunction && createAsyncScope(scope),
          1 === id
            ? createContext(scope)
            : 2 === id
              ? (setTmp(scope), compileErrorHandler(scope))
              : 3 === id &&
                (setTmp(scope),
                compileErrorHandler(scope),
                createContext(scope)));
    }
    for (let i = 0, handlers = group[1]; i < handlers.length; i++) {
      let handler = handlers[i];
      hooks.compileHandler(
        handler[2],
        handler[3],
        prefix + ('/' === handler[1] || '' !== prefix ? '' : handler[1]),
        scope,
      );
    }
    let childGroups = group[3];
    if (null != childGroups)
      for (let childPrefix in childGroups)
        hydrateDependency(
          childGroups[childPrefix],
          scope.slice(),
          '/' === childPrefix ? prefix : prefix + childPrefix,
        );
  };
(() => {
  let hook = (fn) => (injectExternalDependency(fn), '');
  (hooks = { compileHandler: hook, compileErrorHandler: hook }),
    hydrateDependency(main_default, [!1, !1, , '', !1], '');
})(),
  ((_$1, _1, _2, _3, _4, _5, _6) => {
    _$1.push(
      (() => {
        var t = ['text/html', 'application/json'].map((c) => [
            'Content-Type',
            c,
          ]),
          [mwh, mwj] = t,
          [mwoh, mwoj] = t.map((c) => ({ headers: [c] })),
          [mwn, mwb] = [404, 400].map((s) => new Response(null, { status: s })),
          mwc = (r) => ({ status: 200, req: r, headers: [] });
        return (r) => {
          let u = r.url,
            s = u.indexOf('/', 12) + 1,
            e = u.indexOf('?', s),
            p = -1 === e ? u.slice(s) : u.slice(s, e);
          if ('POST' === r.method && 'api' === p) {
            let c = mwc(r);
            return (
              _2(c),
              (c.id = _3()),
              (async () => ((c.body = await _5(c)), new Response(_6(c), c)))()
            );
          }
          if ('path' === p) {
            let c = mwc(r);
            return _2(c), (c.id = _3()), new Response(_4(c), c);
          }
          return mwn;
        };
      })(),
    );
  })(
    ...(() => {
      let n = [compiledDependencies].concat(externalDependencies);
      return (externalDependencies.length = 0), n;
    })(),
  );
var _1_default = { fetch: getDependency(0) };
export { _1_default as default };
```

### Hydration
```ts
import { isHydrating } from 'runtime-compiler/config';

// false while building the output string
// true while only building dependencies
// Use this to for minifiedrs to eliminate unused code path in final output
isHydrating;
```

### Compiling external dependencies
```ts
import { injectDependency, markDependency, getDependency } from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';

// Better tree shaking
const hello = isHydrating
  ? markDependency<() => void>()
  : injectDependency<() => void>(`() => console.log('hello')`);

// After compiler is executed
getDependency(hello)();
```

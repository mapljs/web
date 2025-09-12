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
import { writeFileSync } from 'node:fs';

// Output file
const ENTRY = ...;

writeFileSync(
  ENTRY,
  `
    import "@mapl/web/compiler/aot-loader";

    import app from '${import.meta.resolve('./main.js')}';
    import hydrate from '@mapl/web/compiler/aot';

    export default {
      fetch: (${compileToString(app)})(...hydrate(app))
    };
  `,
);
const input = await rolldown({
  input: ENTRY,
  treeshake: {
    propertyReadSideEffects: false,
    moduleSideEffects: false,
  },
  transform: {
    typescript: {
      rewriteImportExtensions: true,
    },
  },
});
const output = await input.generate();
const code = minifySync(output.output[0].code, {
  module: true,
  mangle: false,
}).code;

writeFileSync(ENTRY, code);
```

Example output:
```js
var core_default = (middlewares, handlers, children) => [
  middlewares,
  handlers,
  ,
  children,
];
let attach = (prop, f) => [1, f, prop],
  noType = { type: null },
  mergeData = (...dat) =>
    0 === dat.length ? noType : Object.assign({ type: null }, ...dat);
var main_default = core_default(
  [
    [
      0,
      (c) => {
        console.log(c.req);
      },
    ],
    attach('id', () => performance.now()),
  ],
  [
    ((path, handler, ...dat) => ['', path, handler, mergeData(...dat)])(
      '/path',
      (c) => c.id,
    ),
  ],
  {
    '/api': core_default(
      [attach('body', async (c) => c.req.text())],
      [
        ((path, handler, ...dat) => ['POST', path, handler, mergeData(...dat)])(
          '/body',
          (c) => c.body,
        ),
      ],
    ),
  },
);
let AsyncFunction = (async () => {}).constructor,
  compilerState = [, , , , ,],
  compileErrorHandler$1 = (scope) =>
    (scope[3] ??= compilerState[4](scope[2][0], scope[2][1], scope)),
  clearErrorHandler = (scope) => {
    null != scope[2] && (scope[3] = null);
  },
  createContext = (scope) =>
    scope[1]
      ? ''
      : ((scope[1] = !0), clearErrorHandler(scope), compilerState[2]),
  createAsyncScope = (scope) =>
    scope[0]
      ? ''
      : ((scope[0] = !0), clearErrorHandler(scope), 'return (async()=>{'),
  setTmp = (scope) => (scope[4] ? 't' : ((scope[4] = !0), 'let t')),
  hydrateDependency = (group, scope, prefix) => {
    null != group[2] && ((scope[2] = group[2]), (scope[3] = null));
    for (let i = 0, middlewares = group[0]; i < middlewares.length; i++) {
      let middleware = middlewares[i],
        fn = middleware[1],
        id = middleware[0];
      -1 === id
        ? fn(scope)
        : (compilerState[1].push(fn),
          fn.length > 0 && createContext(scope),
          fn instanceof AsyncFunction && createAsyncScope(scope),
          1 === id
            ? createContext(scope)
            : 2 === id
              ? (setTmp(scope), compileErrorHandler$1(scope))
              : 3 === id &&
                (setTmp(scope),
                compileErrorHandler$1(scope),
                createContext(scope)));
    }
    for (let i = 0, handlers = group[1]; i < handlers.length; i++) {
      let handler = handlers[i];
      compilerState[3](
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
  },
  _ = Symbol.for('@safe-std/error');
var aot_default = {
  fetch: ((me, mwc, f1, f2, f3, f4, f5) => {
    var t = ['text/html', 'application/json'].map((c) => ['Content-Type', c]),
      [mwh, mwj] = t,
      [mwoh, mwoj] = t.map((c) => ({ headers: [c] })),
      [mwn, mwb] = [404, 400].map((s) => new Response(null, { status: s }));
    return (r) => {
      let u = r.url,
        s = u.indexOf('/', 12) + 1,
        e = u.indexOf('?', s),
        p = -1 === e ? u.slice(s) : u.slice(s, e);
      if ('POST' === r.method && 'api' === p) {
        let c = mwc(r);
        return (
          f1(c),
          (c.id = f2()),
          (async () => ((c.body = await f4(c)), new Response(f5(c), c)))()
        );
      }
      if ('path' === p) {
        let c = mwc(r);
        return f1(c), (c.id = f2()), new Response(f3(c), c);
      }
      return mwn;
    };
  })(
    ...((compilerState[0] = {}),
    (compilerState[1] = []),
    (compilerState[2] = ''),
    (compilerState[3] = (fn) => (compilerState[1].push(fn), '')),
    (compilerState[4] = (fn) => (compilerState[1].push(fn), '')),
    hydrateDependency(main_default, [!1, !1, , '', !1], ''),
    [
      (u) => Array.isArray(u) && u[0] === _,
      (r) => ({ status: 200, req: r, headers: [] }),
    ].concat(compilerState[1])),
  ),
};
export { aot_default as default };
```

### Hydration
```ts
import { isHydrating } from '@mapl/web/compiler/config';

// false while building the output string
// true while only building dependencies
// Use this to for minifiedrs to eliminate unused code path in final output
isHydrating();
```

### Compiling external dependencies
```ts
import { injectLocalDependency, localDependency } from '@mapl/web/compiler';

const hello = injectLocalDependency<() => void>(`() => console.log('hello')`);
// After compiler is executed
localDependency(hello)();
```

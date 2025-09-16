let isHydrating = !1;
isHydrating = !0;
var core_default = (middlewares, handlers, children) => [
  middlewares,
  handlers,
  ,
  children,
];
let noOpMacro = ((f) => [-1, f])(() => ''),
  attach = (prop, f) => [1, f, prop],
  noType = { type: null },
  mergeData = (...dat) =>
    0 === dat.length ? noType : Object.assign({ type: null }, ...dat),
  compiledDependencies = [],
  externalDependencies = [],
  localDepsCnt = 0,
  markDependency = () => localDepsCnt++,
  getDependency = (c) => compiledDependencies[c],
  injectExternalDependency = (e) => '_' + externalDependencies.push(e);
const logID = markDependency(),
  logID2 = markDependency();
var f,
  handler,
  headers,
  main_default = core_default(
    [
      ((f = (c) => {
        console.log(c.req), getDependency(logID)(), getDependency(logID2)();
      }),
      [0, f]),
      attach('id', () => performance.now()),
      ((headers = { 'x-powered-by': '@mapl/web' }),
      injectExternalDependency(
        Array.isArray(headers)
          ? headers
          : headers instanceof Headers
            ? headers.entries().toArray()
            : Object.entries(headers),
      ),
      noOpMacro),
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
        fn$1 = middleware[1],
        id = middleware[0];
      -1 === id
        ? fn$1(scope)
        : (injectExternalDependency(fn$1),
          fn$1.length > 0 && createContext(scope),
          fn$1 instanceof AsyncFunction && createAsyncScope(scope),
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
  let hook = (fn$1) => (injectExternalDependency(fn$1), '');
  (hooks = { compileHandler: hook, compileErrorHandler: hook }),
    hydrateDependency(main_default, [!1, !1, , '', !1], '');
})(),
  ((_$1, _1, _2, _3, _4, _5, _6, _7) => {
    _$1.push(
      () => console.log('ID:', +Math.random().toFixed(2)),
      () => console.log('ID:', +Math.random().toFixed(2)),
      (() => {
        var t = ['text/html', 'application/json'].map((c) => [
            'Content-Type',
            c,
          ]),
          [h, j] = t,
          [oh, oj] = t.map((c) => ({ headers: [c] })),
          [n, b] = [404, 400].map((s) => new Response(null, { status: s }));
        return (r) => {
          let u = r.url,
            s = u.indexOf('/', 12) + 1,
            e = u.indexOf('?', s),
            p = -1 === e ? u.slice(s) : u.slice(s, e);
          if ('POST' === r.method && 'api' === p) {
            let hd = [],
              c = { status: 200, req: r, headers: hd };
            return (
              _2(c),
              (c.id = _3()),
              hd.push(..._4),
              (async () => ((c.body = await _6(c)), new Response(_7(c), c)))()
            );
          }
          if ('path' === p) {
            let hd = [],
              c = { status: 200, req: r, headers: hd };
            return _2(c), (c.id = _3()), hd.push(..._4), new Response(_5(c), c);
          }
          return n;
        };
      })(),
    );
  })(
    ...(() => {
      let n = [compiledDependencies].concat(externalDependencies);
      return (externalDependencies.length = 0), n;
    })(),
  );
var _1_default = { fetch: getDependency(2) };
export { _1_default as default };

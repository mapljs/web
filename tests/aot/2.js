let isHydrating = !1;
isHydrating = !0;
var core_default = (middlewares, handlers, children) => [
  middlewares,
  handlers,
  ,
  children,
];
let noOpMacro = [-1, () => ''],
  tap = (f) => [0, f],
  attach = (prop, f) => [1, f, prop],
  noType = { type: null },
  mergeData = (...dat) =>
    0 === dat.length ? noType : Object.assign({ type: null }, ...dat),
  compiledDependencies = [],
  externalDependencies = [],
  exportedDepsCnt = 0,
  markExported = () => exportedDepsCnt++,
  getDependency = (d) => compiledDependencies[d],
  injectExternalDependency = (e) => '_' + externalDependencies.push(e);
const logRequest = markExported();
var headers,
  handler,
  main_default = core_default(
    [
      noOpMacro,
      tap((c) => getDependency(logRequest)(c.req)),
      attach('id', () => performance.now()),
      ((headers = { 'x-powered-by': '@mapl/web' }),
      (headers = Array.isArray(headers)
        ? headers
        : headers instanceof Headers
          ? headers.entries().toArray()
          : Object.entries(headers)),
      tap((c) => {
        c.headers.push(...headers);
      })),
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
    hydrateDependency(main_default, [!1, !1, , '', !1], ''),
    markExported();
})(),
  ((_$1, _1, _2, _3, _4, _5, _6, _7) => {
    let __1 = () => console.log('ID:', +Math.random().toFixed(2)),
      __2 = (() => {
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
            __1();
            let c = { status: 200, req: r, headers: [] };
            return (
              _2(c),
              (c.id = _3()),
              _4(c),
              (async () => ((c.body = await _6(c)), new Response(_7(c), c)))()
            );
          }
          if ('path' === p) {
            __1();
            let c = { status: 200, req: r, headers: [] };
            return _2(c), (c.id = _3()), _4(c), new Response(_5(c), c);
          }
          return n;
        };
      })();
    _$1.push((r) => console.log(r.method, r.url), __2);
  })(
    ...(() => {
      let n = [compiledDependencies].concat(externalDependencies);
      return (externalDependencies.length = 0), n;
    })(),
  );
var _1_default = { fetch: getDependency(1) };
export { _1_default as default };

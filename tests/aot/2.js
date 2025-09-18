let isHydrating = !1;
isHydrating = !0;
var core_default = (middlewares, handlers, children) => [
  middlewares,
  handlers,
  ,
  children,
];
let hooks,
  macro = (f) => [-1, f],
  noOpMacro = macro(() => ''),
  attach = (prop, f) => [1, f, prop],
  noType = { type: null },
  mergeData = (...dat) =>
    0 === dat.length ? noType : Object.assign({ type: null }, ...dat),
  compiledDependencies = [],
  externalDependencies = [],
  localDeps = '',
  localDepsCnt = 0,
  exportedDeps = '',
  exportedDepsCnt = 0,
  markExported = () => exportedDepsCnt++,
  getDependency = (h) => compiledDependencies[h],
  injectExternalDependency = (e) => '_' + externalDependencies.push(e),
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
let createContextMacro = macro(createContext);
const logRequest = markExported();
var f, handler;
((router) => {
  let hook = (fn) => (injectExternalDependency(fn), '');
  (hooks = { compileHandler: hook, compileErrorHandler: hook }),
    hydrateDependency(router, [!1, !1, , '', !1], ''),
    markExported();
})(
  core_default(
    [
      createContextMacro,
      ((f = (c) => getDependency(logRequest)(c.req)), [0, f]),
      attach('id', () => performance.now()),
      noOpMacro,
    ],
    [((handler = (c) => c.id), ['', '/path', handler, mergeData()])],
    {
      '/api': core_default(
        [attach('body', async (c) => c.req.text())],
        [['POST', '/body', (c) => c.body, mergeData()]],
      ),
    },
  ),
),
  ((_$1, _1, _2, _3, _4, _5, _6) => {
    var __1 = ['access-control-allow-origin', '*'],
      __2 = ['access-control-max-age', '60000'],
      __3 = (r, h) => {
        h.push(__1), 'OPTIONS' === r.method && h.push(__2);
      },
      __4 = ['x-powered-by', '@mapl/web'],
      __5 = (() => {
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
              __3(r, hd),
              _2(c),
              (c.id = _3()),
              hd.push(__4),
              (async () => ((c.body = await _5(c)), new Response(_6(c), c)))()
            );
          }
          if ('path' === p) {
            let hd = [],
              c = { status: 200, req: r, headers: hd };
            return (
              __3(r, hd),
              _2(c),
              (c.id = _3()),
              hd.push(__4),
              new Response(_4(c), c)
            );
          }
          return n;
        };
      })();
    _$1.push((r) => console.log(r.method, r.url), __5);
  })(
    ...(() => {
      let r = [compiledDependencies].concat(externalDependencies);
      return (
        (externalDependencies.length = 0),
        (localDeps = ''),
        (localDepsCnt = 0),
        (exportedDeps = ''),
        (exportedDepsCnt = 0),
        r
      );
    })(),
  );
var _1_default = { fetch: getDependency(1) };
export { _1_default as default };

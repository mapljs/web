let isHydrating = !1;
isHydrating = !0;
var core_default = (middlewares, handlers, children) => [
  middlewares,
  handlers,
  ,
  children,
];
let hooks,
  macro$1 = (f) => [-1, f],
  noOpMacro$1 = macro$1(() => ''),
  compiledDependencies = [],
  externalDependencies = [],
  localDeps = '',
  localDepsCnt = 0,
  exportedDeps = '',
  exportedDepsCnt = 0,
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
let createContextMacro$1 = macro$1(createContext),
  macro = (f) => [-1, f],
  parserTag = (macro(() => ''), macro(createContext), Symbol());
var u;
let bodyErr = ((u = parserTag), (d) => [_, d, u])('malformed body'),
  json =
    (injectExternalDependency(bodyErr),
    () =>
      macro(
        (f) => (
          createAsyncScope(f),
          setTmp(f),
          compileErrorHandler(f),
          createContext(f),
          ''
        ),
      )),
  string = [4];
var required,
  handler,
  main_default = core_default(
    [createContextMacro$1, noOpMacro$1],
    [
      ((handler = (c) => '' + performance.now()),
      ['', '/path', handler, void 0]),
    ],
    {
      '/api': core_default(
        [
          json(
            'body',
            ((required = { name: string, pwd: string }),
            [16, required, void 0]),
          ),
        ],
        [['POST', '/body', (c) => c.body, { type: 'json' }]],
      ),
    },
  );
(() => {
  let hook = (fn) => (injectExternalDependency(fn), '');
  (hooks = { compileHandler: hook, compileErrorHandler: hook }),
    hydrateDependency(main_default, [!1, !1, , '', !1], ''),
    exportedDepsCnt++;
})(),
  ((_$1, _1, _2, _3, _4) => {
    var __0 = ['access-control-allow-origin', '*'],
      __1 = ['access-control-max-age', '60000'],
      __2 = (r, h) => {
        h.push(__0), 'OPTIONS' === r.method && h.push(__1);
      },
      __3 = ['x-powered-by', '@mapl/web'],
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
              __2(r, hd),
              hd.push(__3),
              (async () => {
                let t$1 = await r.json().catch(() => {});
                return null !== (o = t$1) &&
                  'object' == typeof o &&
                  'string' == typeof o.name &&
                  'string' == typeof o.pwd
                  ? ((t$1 = _2), b)
                  : ((c.body = t$1),
                    hd.push(j),
                    new Response(JSON.stringify(_4(c)), c));
                var o;
              })()
            );
          }
          if ('path' === p) {
            let hd = [],
              c = { status: 200, req: r, headers: hd };
            return __2(r, hd), hd.push(__3), new Response(_3(c), c);
          }
          return n;
        };
      })();
    _$1.push(__5);
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
var _1_default = { fetch: compiledDependencies[0] };
export { _1_default as default };

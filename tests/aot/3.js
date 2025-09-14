let hooks, n;
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
let _ = Symbol.for('@safe-std/error'),
  compiledDependencies = [],
  externalDependencies = [],
  injectExternalDependency = (e) => '_' + externalDependencies.push(e);
injectExternalDependency((u) => Array.isArray(u) && u[0] === _);
let AsyncFunction = (async () => {}).constructor,
  compileErrorHandler = (scope) =>
    (scope[3] ??= hooks.compileErrorHandler(scope[2][0], scope[2][1], scope)),
  clearErrorHandler = (scope) => {
    null != scope[2] && (scope[3] = null);
  },
  createContext = (scope) => (
    scope[1] || ((scope[1] = !0), clearErrorHandler(scope)), ''
  ),
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
  },
  hook = (fn) => (injectExternalDependency(fn), '');
(hooks = { compileHandler: hook, compileErrorHandler: hook }),
  hydrateDependency(main_default, [!1, !1, , '', !1], ''),
  ((_$1, _1, _2, _3, _4, _5, _6) =>
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
    ))(
    ...((n = [compiledDependencies].concat(externalDependencies)),
    (externalDependencies.length = 0),
    n),
  );
var _1_default = { fetch: compiledDependencies[0] };
export { _1_default as default };

let isHydrating = !1;
isHydrating = !0;
var router = (middlewares, handlers, children) => [
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
  localDepsCnt = 0,
  injectDependency = (c) => localDepsCnt++,
  getDependency = (e) => compiledDependencies[e],
  injectExternalDependency = (e) => '_' + externalDependencies.push(e);
console.log(!0);
const logID = injectDependency(),
  logID2 = injectDependency();
var f,
  handler,
  app = router(
    [
      ((f = (c) => {
        console.log(c.req), getDependency(logID)(), getDependency(logID2)();
      }),
      [0, f]),
      attach('id', () => performance.now()),
    ],
    [((handler = (c) => c.id), ['', '/path', handler, mergeData()])],
    {
      '/api': router(
        [attach('body', async (c) => c.req.text())],
        [['POST', '/body', (c) => c.body, mergeData()]],
      ),
    },
  );
let _ = Symbol.for('@safe-std/error');
injectExternalDependency((u) => Array.isArray(u) && u[0] === _);
let hooks,
  AsyncFunction = (async () => {}).constructor,
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
  };
(() => {
  let hook = (fn) => (injectExternalDependency(fn), '');
  (hooks = { compileHandler: hook, compileErrorHandler: hook }),
    hydrateDependency(app, [!1, !1, , '', !1], '');
})(),
  ((_, _1, _2, _3, _4, _5, _6) => {
    _.push(
      () => console.log('ID:', +Math.random().toFixed(2)),
      () => console.log('ID:', +Math.random().toFixed(2)),
      (() => {
        var [mwn, mwb] = [404, 400].map(
            (s) => new Response(null, { status: s }),
          ),
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
var _1 = { fetch: getDependency(2) };
export { _1 as default };

let isHydrating = !1;
isHydrating = !0;
var core_default = (middlewares, handlers, children) => [
  middlewares,
  handlers,
  ,
  children,
];
let compileHandlerHook,
  compileErrorHandlerHook,
  compiledDependencies = [],
  externalDependencies = [],
  cache = {},
  exportedDepsCnt = 0,
  injectExternalDependency = (e) => '_' + externalDependencies.push(e),
  noOp = () => '',
  lazyDependency = (e, v) => {
    let b = Symbol();
    return () => (cache[b] ??= e(v));
  },
  macro$1 = (f) => [-1, f],
  noOpMacro$1 = macro$1(noOp),
  text = noOp,
  _ = Symbol.for('@safe-std/error'),
  IS_ERR_FN = lazyDependency(
    injectExternalDependency,
    (u) => Array.isArray(u) && u[0] === _,
  ),
  AsyncFunction = (async () => {}).constructor,
  compileErrorHandler = (input, scope) =>
    (scope[3] ??= compileErrorHandlerHook(
      input,
      scope[2][0],
      scope[2][1],
      scope,
    )),
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
              ? (setTmp(scope), IS_ERR_FN(), compileErrorHandler('t', scope))
              : 3 === id &&
                (setTmp(scope),
                IS_ERR_FN(),
                compileErrorHandler('t', scope),
                createContext(scope)));
    }
    for (let i = 0, handlers = group[1]; i < handlers.length; i++) {
      let handler = handlers[i];
      compileHandlerHook(
        handler,
        '',
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
  parserTag = (macro(noOp), macro(createContext), Symbol());
var u;
let bodyErr = ((u = parserTag), (d) => [_, d, u])('malformed body'),
  ERROR_DEP = lazyDependency(injectExternalDependency, bodyErr),
  string = [4],
  dict = (required, optional) => [16, required, optional];
var handler,
  dat,
  fn,
  main_default = core_default(
    [createContextMacro$1, noOpMacro$1],
    [
      ((handler = () => '' + performance.now()),
      (dat = { type: text }),
      ['', '/path', handler, dat]),
    ],
    {
      '/api': ((r, f, dat) => ((r[2] = [(err) => err[1], dat]), r))(
        core_default(
          [
            (dict({ name: string, pwd: string }),
            macro(
              (p) => (
                createAsyncScope(p),
                setTmp(p),
                ERROR_DEP(),
                compileErrorHandler('', p),
                createContext(p),
                ''
              ),
            )),
          ],
          [
            [
              'POST',
              '/body',
              (c) => c.body,
              { type: (dict({ name: string, pwd: string }), noOp) },
            ],
          ],
        ),
        0,
        { type: text },
      ),
    },
  );
(fn = (handler, _$1, _1, scope) => {
  let fn = handler[2];
  injectExternalDependency(fn),
    handler[3]?.type?.(
      '',
      scope[1] ||
        fn.length >
          ((path) => {
            let cnt = path.endsWith('**') ? 2 : 0;
            for (
              let i = path.length - cnt;
              -1 !== (i = path.lastIndexOf('*', i - 1));
              cnt++
            );
            return cnt;
          })(handler[1]),
    );
}),
  (compileHandlerHook = fn),
  (compileErrorHandlerHook = (_$1, fn, dat, scope) => (
    injectExternalDependency(fn), dat?.type?.('', scope[1] || fn.length > 1), ''
  )),
  hydrateDependency(main_default, [!1, !1, , '', !1], ''),
  exportedDepsCnt++,
  ((_$1, _1, _2, _3, _4) => {
    var $0 = ['access-control-allow-origin', '*'],
      $1 = ['access-control-max-age', '60000'],
      $2 = (r, h) => {
        h.push($0), 'OPTIONS' === r.method && h.push($1);
      },
      $3 = ['x-powered-by', '@mapl/web'],
      $5 = ['content-type', 'application/json'];
    _$1.push((r) => {
      let u = r.url,
        s = u.indexOf('/', 12) + 1,
        e = u.indexOf('?', s),
        p = -1 === e ? u.slice(s) : u.slice(s, e);
      if ('POST' === r.method && 'api' === p) {
        let h = [],
          c = { status: 200, req: r, headers: h };
        return (
          $2(r, h),
          h.push($3),
          (async () => {
            let t = await r.json().catch(() => {});
            return null !== (o = t) &&
              'object' == typeof o &&
              'string' == typeof o.name &&
              'string' == typeof o.pwd
              ? new Response(_3(_2), c)
              : ((c.body = t),
                h.push($5),
                new Response(JSON.stringify(_4(c)), c));
            var o;
          })()
        );
      }
      if ('path' === p) {
        let h = [],
          c = { status: 200, req: r, headers: h };
        return $2(r, h), h.push($3), new Response(_1(), c);
      }
      return $2;
    });
  })(
    ...(() => {
      let r = [compiledDependencies].concat(externalDependencies);
      return (
        (externalDependencies.length = 0),
        (cache = {}),
        (exportedDepsCnt = 0),
        r
      );
    })(),
  );
var target_any_aot__built__default = { fetch: compiledDependencies[0] };
export { target_any_aot__built__default as default };

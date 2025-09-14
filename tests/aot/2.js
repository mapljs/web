let hydrating = () => {};
hydrating();
var core_default = (middlewares, handlers, children) => [
  middlewares,
  handlers,
  ,
  children,
];
let tap = (f) => [0, f];
let attach = (prop, f) => [1, f, prop];
let noType = { type: null };
let mergeData = (...dat) =>
  dat.length === 0 ? noType : Object.assign({ type: null }, ...dat);
let any = (path, handler, ...dat) => [``, path, handler, mergeData(...dat)];
let post = (path, handler, ...dat) => [
  `POST`,
  path,
  handler,
  mergeData(...dat),
];
var main_default = core_default(
  [
    tap((c) => {
      console.log(c.req);
    }),
    attach('id', () => performance.now()),
  ],
  [any('/path', (c) => c.id)],
  {
    '/api': core_default(
      [attach('body', async (c) => c.req.text())],
      [post('/body', (c) => c.body)],
    ),
  },
);
let _ = Symbol.for(`@safe-std/error`);
let isErr = (u) => Array.isArray(u) && u[0] === _;
let compiledDependencies = [];
let externalDependencies = [];
let getDependency = (e) => compiledDependencies[e];
let injectExternalDependency = (e) => `_` + externalDependencies.push(e);
(async () => {}).constructor;
injectExternalDependency(isErr);
let AsyncFunction = (async () => {}).constructor;
let hooks;
let setHooks = (allHooks) => {
  hooks = allHooks;
};
let contextInit = ``;
let compileErrorHandler = (scope) =>
  (scope[3] ??= hooks.compileErrorHandler(scope[2][0], scope[2][1], scope));
let clearErrorHandler = (scope) => {
  scope[2] != null && (scope[3] = null);
};
let createContext = (scope) => {
  if (scope[1]) return ``;
  scope[1] = true;
  clearErrorHandler(scope);
  return contextInit;
};
let createAsyncScope = (scope) => {
  if (scope[0]) return ``;
  scope[0] = true;
  clearErrorHandler(scope);
  return `return (async()=>{`;
};
let setTmp = (scope) => {
  if (scope[4]) return `t`;
  scope[4] = true;
  return `let t`;
};
let hydrateDependency = (group, scope, prefix) => {
  if (group[2] != null) {
    scope[2] = group[2];
    scope[3] = null;
  }
  for (let i = 0, middlewares = group[0]; i < middlewares.length; i++) {
    let middleware = middlewares[i];
    let fn = middleware[1];
    let id = middleware[0];
    if (id === -1) fn(scope);
    else {
      injectExternalDependency(fn);
      if (fn.length > 0) createContext(scope);
      if (fn instanceof AsyncFunction) createAsyncScope(scope);
      if (id === 1) createContext(scope);
      else if (id === 2) {
        setTmp(scope);
        compileErrorHandler(scope);
      } else if (id === 3) {
        setTmp(scope);
        compileErrorHandler(scope);
        createContext(scope);
      }
    }
  }
  for (let i = 0, handlers = group[1]; i < handlers.length; i++) {
    let handler = handlers[i];
    hooks.compileHandler(
      handler[2],
      handler[3],
      prefix + (handler[1] === `/` || prefix !== `` ? `` : handler[1]),
      scope,
    );
  }
  let childGroups = group[3];
  if (childGroups != null)
    for (let childPrefix in childGroups)
      hydrateDependency(
        childGroups[childPrefix],
        scope.slice(),
        childPrefix === `/` ? prefix : prefix + childPrefix,
      );
};
var aot_default = (router) => {
  let hook = (fn) => {
    injectExternalDependency(fn);
    return ``;
  };
  setHooks({
    compileHandler: hook,
    compileErrorHandler: hook,
  });
  hydrateDependency(router, [false, false, , ``, false], ``);
};
let hydrate = () => {
  let n = [compiledDependencies].concat(externalDependencies);
  externalDependencies.length = 0;
  return n;
};
aot_default(main_default);
((_$1, _1, _2, _3, _4, _5, _6) =>
  _$1.push(
    (() => {
      var t = ['text/html', 'application/json'].map((c) => ['Content-Type', c]),
        [mwh, mwj] = t,
        [mwoh, mwoj] = t.map((c) => ({ headers: [c] })),
        [mwn, mwb] = [404, 400].map((s) => new Response(null, { status: s })),
        mwc = (r) => ({
          status: 200,
          req: r,
          headers: [],
        });
      return (r) => {
        let u = r.url,
          s = u.indexOf('/', 12) + 1,
          e = u.indexOf('?', s),
          p = e === -1 ? u.slice(s) : u.slice(s, e);
        if (r.method === 'POST') {
          if (p === 'api') {
            let c = mwc(r);
            _2(c);
            c.id = _3();
            return (async () => {
              c.body = await _5(c);
              return new Response(_6(c), c);
            })();
          }
        }
        if (p === 'path') {
          let c = mwc(r);
          _2(c);
          c.id = _3();
          return new Response(_4(c), c);
        }
        return mwn;
      };
    })(),
  ))(...hydrate());
var _1_default = { fetch: getDependency(0) };
export { _1_default as default };

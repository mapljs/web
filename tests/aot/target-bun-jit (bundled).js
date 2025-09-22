var core_default = (middlewares, handlers, children) => [
  middlewares,
  handlers,
  ,
  children,
];
let jsonHeader,
  jsonOptions,
  compileHandlerHook,
  compileErrorHandlerHook,
  macro$1 = (f) => [-1, f],
  compiledDependencies = (macro$1(() => ''), []),
  externalDependencies = [],
  persistentDependencies = [],
  localDeps = '',
  localDepsCnt = 0,
  injectDependency = (e) => (
    (localDeps =
      '' === localDeps
        ? 'var $' + localDepsCnt + '=' + e
        : localDeps + ',$' + localDepsCnt + '=' + e),
    '$' + localDepsCnt++
  ),
  asyncDeps = '',
  exportedDeps = '',
  exportedDepsCnt = 0,
  injectExternalDependency = (e) => '_' + externalDependencies.push(e),
  injectPersistentDependency = (e) => '__' + persistentDependencies.push(e),
  text = (res, hasContext) =>
    'return new Response(' + res + (hasContext ? ',c)' : ')'),
  _ = Symbol.for('@safe-std/error'),
  isErr = (u) => Array.isArray(u) && u[0] === _,
  IS_ERR$1 = injectPersistentDependency(isErr),
  AsyncFunction = (async () => {}).constructor,
  contextInit = '',
  compileErrorHandler$1 = (input, scope) =>
    (scope[3] ??= compileErrorHandlerHook(
      input,
      scope[2][0],
      scope[2][1],
      scope,
    )),
  clearErrorHandler$1 = (scope) => {
    null != scope[2] && (scope[3] = null);
  },
  createContext = (scope) =>
    scope[1] ? '' : ((scope[1] = !0), clearErrorHandler$1(scope), contextInit),
  createAsyncScope = (scope) =>
    scope[0]
      ? ''
      : ((scope[0] = !0), clearErrorHandler$1(scope), 'return (async()=>{'),
  setTmp = (scope) => (scope[4] ? 't' : ((scope[4] = !0), 'let t')),
  compileGroup = (group, scope, prefix, content) => {
    null != group[2] && ((scope[2] = group[2]), (scope[3] = null));
    for (let i = 0, middlewares = group[0]; i < middlewares.length; i++) {
      let middleware = middlewares[i],
        fn = middleware[1],
        id = middleware[0];
      if (-1 === id) content += fn(scope);
      else {
        let call = injectExternalDependency(fn) + '(';
        fn.length > 0 && ((call += 'c'), (content += createContext(scope))),
          (call += ')'),
          fn instanceof AsyncFunction &&
            ((call = 'await ' + call), (content += createAsyncScope(scope))),
          0 === id
            ? (content += call + ';')
            : 1 === id
              ? (content +=
                  createContext(scope) +
                  'c.' +
                  middleware[2] +
                  '=' +
                  call +
                  ';')
              : 2 === id
                ? (content +=
                    setTmp(scope) +
                    '=' +
                    call +
                    ';if(' +
                    IS_ERR$1 +
                    '(t)){' +
                    compileErrorHandler$1('t', scope) +
                    '}')
                : 3 === id &&
                  (content +=
                    setTmp(scope) +
                    '=' +
                    call +
                    ';if(' +
                    IS_ERR$1 +
                    '(t)){' +
                    compileErrorHandler$1('t', scope) +
                    '}' +
                    createContext(scope) +
                    'c.' +
                    middleware[2] +
                    '=t;');
      }
    }
    for (let i = 0, handlers = group[1]; i < handlers.length; i++) {
      let handler = handlers[i];
      compileHandlerHook(
        handler,
        content,
        prefix + ('/' === handler[1] || '' !== prefix ? '' : handler[1]),
        scope,
      );
    }
    let childGroups = group[3];
    if (null != childGroups)
      for (let childPrefix in childGroups)
        compileGroup(
          childGroups[childPrefix],
          scope.slice(),
          '/' === childPrefix ? prefix : prefix + childPrefix,
          content,
        );
  },
  injectList = (list) =>
    list.length > 1
      ? '...' + injectDependency(JSON.stringify(list))
      : injectDependency(JSON.stringify(list[0]));
macro$1(createContext);
let macro = (f) => [-1, f];
macro(() => ''), [].push(isErr);
let optimizeDirectCall =
    (macro(
      (scope) => (
        scope[1] ||
          ((scope[1] = !0),
          ((scope) => {
            null != scope[2] && (scope[3] = null);
          })(scope)),
        ''
      ),
    ),
    (s) =>
      'o=>Number.isInteger(o)' === s
        ? 'Number.isInteger'
        : 'o=>JSON.stringify(o)' === s
          ? 'JSON.stringify'
          : /^o=>d\d+\(o\)$/.test(s)
            ? s.slice(3, -3)
            : s),
  compileLimits = (arr, start, i) => {
    let str = '';
    for (; start < arr.length; ) {
      let limit = arr[start++],
        id = limit[0];
      str +=
        '&&' +
        (0 === id
          ? i + '>=' + limit[1]
          : 1 === id
            ? i + '<=' + limit[1]
            : 2 === id
              ? i + '.length>' + (limit[1] - 1)
              : 3 === id
                ? i + '.length<' + (limit[1] + 1)
                : 4 === id
                  ? i + '.length===' + limit[1]
                  : 'true');
    }
    return str;
  },
  compileToFn = (t, deps) => 'o=>' + compile(t, 'o', deps, !1),
  compile = (t, i, deps, optional) => {
    let id = t[0],
      str = '',
      isNil = !(1 & ~id);
    isNil
      ? ((id -= 1), (str = '(' + i + (optional ? '==null||' : '===null||')))
      : optional && (str += '(' + i + '===void 0||');
    let wrapped = isNil || optional;
    if (0 === id) str += 'Number.isInteger(' + i + ')' + compileLimits(t, 1, i);
    else if (2 === id)
      str += 'typeof ' + i + '==="number"' + compileLimits(t, 1, i);
    else if (4 === id)
      str += 'typeof ' + i + '==="string"' + compileLimits(t, 1, i);
    else if (6 === id) str += 'typeof ' + i + '==="boolean"';
    else if (8 === id) str += i + '!==void 0';
    else if (10 === id) {
      let list = t[1];
      wrapped || (str += '('), (str += i + '==="' + list[0] + '"');
      for (let j = 1; j < list.length; j++)
        str += '||' + i + '==="' + list[j] + '"';
      wrapped || (str += ')');
    } else if (12 === id)
      str +=
        i + '===' + ('string' == typeof t[1] ? JSON.stringify(t[1]) : t[1]);
    else if (14 === id)
      str +=
        'Array.isArray(' +
        i +
        ')' +
        compileLimits(t, 2, i) +
        '&&' +
        i +
        '.every(d' +
        deps.push(optimizeDirectCall(compileToFn(t[1], deps))) +
        ')';
    else if (16 === id) {
      if (
        ((str +=
          (isNil ? '' : i + '!==null&&') + 'typeof ' + i + '==="object"'),
        (i += '.'),
        null != t[1])
      ) {
        let o = t[1];
        for (const key in o) str += '&&' + compile(o[key], i + key, deps, !1);
      }
      if (null != t[2]) {
        let o = t[2];
        for (const key in o) str += '&&' + compile(o[key], i + key, deps, !0);
      }
    } else if (18 === id) {
      let list = t[1];
      str += 'Array.isArray(' + i + ')&&' + i + '.length===' + list.length;
      for (let j = 0; j < list.length; j++)
        str += '&&' + compile(list[j], i + '[' + j + ']', deps, !1);
    } else if (20 === id) {
      str += (isNil ? '' : i + '!==null&&') + 'typeof ' + i + '==="object"&&(';
      let tag = (i += '.') + t[1];
      for (const key in t[2]) {
        let schema = t[2][key];
        str += tag + '===' + JSON.stringify(key) + '?';
        let first = !0;
        if (null != schema[1]) {
          let o = schema[1];
          for (const key$1 in o)
            first && ((first = !1), (str += '&&')),
              (str += compile(o[key$1], i + key$1, deps, !1));
        }
        if (null != schema[2]) {
          let o = schema[2];
          for (const key$1 in o)
            first && ((first = !1), (str += '&&')),
              (str += compile(o[key$1], i + key$1, deps, !0));
        }
        str += ':';
      }
      str += 'false)';
    } else if (22 === id) str += 'd' + t[1] + '(' + i + ')';
    else if (24 === id) {
      let scope = '(()=>{var ',
        scopeDeps = [];
      if (null != t[2]) {
        let depsObj = t[2];
        for (const key in depsObj)
          scope += 'd' + key + '=' + compileToFn(depsObj[key], scopeDeps) + ',';
      }
      let main = optimizeDirectCall(compileToFn(t[1], scopeDeps));
      for (let i$1 = 0; i$1 < scopeDeps.length; i$1++)
        scope += 'd' + (i$1 + 1) + '=' + scopeDeps[i$1] + ',';
      str +=
        'd' + deps.push(scope + 'd=' + main + ';return d})()') + '(' + i + ')';
    }
    return wrapped ? str + ')' : str;
  },
  parserTag = Symbol();
var u;
let ERROR_DEP = injectPersistentDependency(
    ((u = parserTag), (d) => [_, d, u])('malformed body'),
  ),
  string = [4];
var required,
  handler,
  dat,
  m,
  headers,
  main_default = core_default(
    [
      ((origins, preflightHeaders = [], headers = []) =>
        '*' !== origins &&
        (headers.push(['vary', 'origin']), Array.isArray(origins))
          ? macro$1((scope) => {
              let originList = injectDependency(JSON.stringify(origins));
              return (
                createContext(scope) +
                (injectDependency(
                  '(r,h)=>{let o=r.headers.get("origin");h.push(["access-control-allow-origin",typeof o==="string"&&' +
                    originList +
                    '.includes(o)?o:' +
                    originList +
                    '[0]]);' +
                    (headers.length > 0
                      ? 'h.push(' + injectList(headers) + ');'
                      : '') +
                    (preflightHeaders.length > 0
                      ? 'r.method==="OPTIONS"&&h.push(' +
                        injectList(preflightHeaders) +
                        ')}'
                      : '}'),
                ) +
                  '(r,h);')
              );
            })
          : (headers.push(['access-control-allow-origin', origins]),
            macro$1((scope) => {
              let pushHeaders =
                headers.length > 0
                  ? 'h.push(' + injectList(headers) + ');'
                  : '';
              return (
                createContext(scope) +
                (preflightHeaders.length > 0
                  ? injectDependency(
                      '(r,h)=>{' +
                        pushHeaders +
                        'r.method==="OPTIONS"&&h.push(' +
                        injectList(preflightHeaders) +
                        ')}',
                    ) + '(r,h);'
                  : pushHeaders)
              );
            })))('*', [['access-control-max-age', '60000']]),
      ((headers = { 'x-powered-by': '@mapl/web' }),
      macro$1(
        () =>
          'h.push(' +
          injectList(
            Array.isArray(headers)
              ? headers
              : headers instanceof Headers
                ? headers.entries().toArray()
                : Object.entries(headers),
          ) +
          ');',
      )),
    ],
    [
      ((handler = () => '' + performance.now()),
      (dat = { type: text }),
      ['', '/path', handler, dat]),
    ],
    {
      '/api': ((r, f, dat) => ((r[2] = [(err) => err[1], dat]), r))(
        core_default(
          [
            ((required = { name: string, pwd: string }),
            (m = [16, required, void 0]),
            macro(
              (f) =>
                createAsyncScope(f) +
                setTmp(f) +
                '=await r.json().catch(()=>{});if(' +
                injectDependency(
                  '(()=>{' +
                    (() => {
                      let deps = [],
                        str = optimizeDirectCall(compileToFn(m, deps));
                      return (
                        ((deps) => {
                          let res = '';
                          if (deps.length > 0)
                            for (let i = 0; i < deps.length; i++)
                              res +=
                                (0 === i ? 'var d' : ',d') +
                                (i + 1) +
                                '=' +
                                deps[i];
                          return res;
                        })(deps) +
                        ';return ' +
                        str
                      );
                    })() +
                    '})()',
                ) +
                '(t)){' +
                compileErrorHandler$1(ERROR_DEP, f) +
                '}' +
                createContext(f) +
                'c.body=t;',
            )),
          ],
          [
            [
              'POST',
              '/body',
              (c) => c.body,
              {
                type: (res, hasContext) =>
                  hasContext
                    ? 'h.push(' +
                      (jsonHeader ??= injectDependency(
                        '["content-type","application/json"]',
                      )) +
                      ');return new Response(JSON.stringify(' +
                      res +
                      '),c)'
                    : 'return new Response(JSON.stringify(' +
                      res +
                      '),' +
                      (jsonOptions ??= injectDependency(
                        '{headers:[' + jsonHeader + ']}',
                      )) +
                      ')',
              },
            ],
          ],
        ),
        0,
        { type: text },
      ),
    },
  );
let ROUTES,
  RES404 = injectDependency('new Response(null,{status:404})'),
  RES400 = injectDependency('new Response(null,{status:400})'),
  paramArgs = ((args) => {
    let len = args.length,
      arr = new Array(len + 1);
    (arr[0] = ''), (arr[1] = args[1]);
    for (let i = 2; i <= len; i++) arr[i] = arr[i - 1] + ',' + args[i];
    return arr;
  })(new Array(16).fill(0).map((_1, i) => 'q' + i)),
  compileReturn = (dat, fnAsync, scopeAsync, contextCreated, result) => {
    let res = dat?.type;
    if (null == res) return 'return ' + result;
    let str = res(fnAsync ? 'await ' + result : result, contextCreated);
    return fnAsync && !scopeAsync ? 'return (async()=>{' + str + '})()' : str;
  },
  compileErrorHandler = (input, fn, dat, scope) => {
    let call = injectExternalDependency(fn) + '(' + input;
    return fn.length > 1 && ((call += ',c'), !scope[1])
      ? contextInit +
          compileReturn(
            dat,
            fn instanceof AsyncFunction,
            scope[0],
            !0,
            call + ')',
          )
      : compileReturn(
          dat,
          fn instanceof AsyncFunction,
          scope[0],
          scope[1],
          call + ')',
        );
  },
  insertRoute = (method, path, content) => {
    let isWildcard = path.endsWith('**'),
      i = 0,
      bunPattern = isWildcard
        ? path.slice(-2).replace(/\*/g, () => ':q' + i++) + '*'
        : path.replace(/\*/g, () => ':q' + i++),
      str = '(r,s)=>{';
    if (i > 0) {
      str += 'let {q0';
      for (let j = 1, l = i - (isWildcard ? 1 : 0); j < l; j++) str += 'q,' + j;
      str += '}=r.params' + (isWildcard ? ',q' + i + '=r.params["*"];' : ';');
    }
    ((ROUTES[bunPattern] ??= {})[method] = str + content + '}'),
      '' !== method &&
        'GET' !== method &&
        'HEAD' !== method &&
        'OPTIONS' !== method &&
        'DELETE' !== method &&
        'PATCH' !== method &&
        'POST' !== method &&
        'PUT' !== method &&
        (ROUTES[bunPattern][''] ??= RES404),
      isWildcard &&
        ((ROUTES['/*' === bunPattern ? '/' : bunPattern.slice(0, -3)] ??= {})[
          method
        ] ??= RES404);
  };
Bun.serve({
  routes: (() => {
    let id =
      ((e = injectDependency(
        (((router) => {
          var fn;
          (ROUTES = {}),
            (fn = (handler, prevContent, path, scope) => {
              let fn = handler[2],
                call = injectExternalDependency(fn) + '(',
                paramCount = ((path) => {
                  let cnt = path.endsWith('**') ? 2 : 0;
                  for (
                    let i = path.length - cnt;
                    -1 !== (i = path.lastIndexOf('*', i - 1));
                    cnt++
                  );
                  return cnt;
                })(handler[1]);
              paramCount > 0 && (call += paramArgs[paramCount]),
                fn.length > paramCount &&
                ((call += 0 === paramCount ? 'c' : ',c'), !scope[1])
                  ? insertRoute(
                      handler[0],
                      path,
                      prevContent +
                        contextInit +
                        compileReturn(
                          handler[3],
                          fn instanceof AsyncFunction,
                          scope[0],
                          !0,
                          call + ')',
                        ) +
                        (scope[0] ? '})()' : ''),
                    )
                  : insertRoute(
                      handler[0],
                      path,
                      prevContent +
                        compileReturn(
                          handler[3],
                          fn instanceof AsyncFunction,
                          scope[0],
                          scope[1],
                          call + ')',
                        ) +
                        (scope[0] ? '})()' : ''),
                    );
            }),
            (compileHandlerHook = fn),
            (compileErrorHandlerHook = compileErrorHandler),
            (contextInit = 'let h=[],c={status:200,req:r,server:s,headers:h};'),
            compileGroup(router, [!1, !1, , 'return ' + RES400, !1], '', '');
        })(main_default),
        (() => {
          let str = '{';
          for (let pattern in ROUTES) {
            str += '"' + pattern + '":';
            let methods = ROUTES[pattern],
              allMethods = methods[''];
            if (null == allMethods) {
              str += '{';
              for (let method in methods)
                str += method + ':' + methods[method] + ',';
              str += '},';
            } else if (1 === Object.keys(methods).length)
              str += methods[''] + ',';
            else {
              str += '(r,s)=>';
              for (let method in methods)
                if ('' !== method) {
                  let fn = methods[method];
                  str +=
                    'r.method==="' +
                    method +
                    '"?' +
                    (fn.startsWith('(r,s)=>')
                      ? injectDependency(fn) + '(r,s)'
                      : fn) +
                    ':';
                }
              str +=
                (allMethods.startsWith('(r,s)=>')
                  ? injectDependency(allMethods) + '(r,s)'
                  : allMethods) + ',';
            }
          }
          return str + '}';
        })()),
      )),
      (exportedDeps += e + ','),
      exportedDepsCnt++);
    var e;
    return (
      Function(
        (() => {
          let e = '_,';
          for (let y = 0; y < externalDependencies.length; y++)
            e += '_' + (y + 1) + ',';
          for (let v = 0; v < persistentDependencies.length; v++)
            e += '__' + (v + 1) + ',';
          return e;
        })(),
        '{' +
          localDeps +
          ('' === asyncDeps
            ? ';_.push('
            : ';[' +
              asyncDeps +
              ']=await Promise.all([' +
              asyncDeps +
              ']);_.push(') +
          exportedDeps +
          ')}',
      )(
        compiledDependencies,
        ...externalDependencies,
        ...persistentDependencies,
      ),
      (externalDependencies.length = 0),
      (localDeps = ''),
      (localDepsCnt = 0),
      (asyncDeps = ''),
      (exportedDeps = ''),
      (exportedDepsCnt = 0),
      compiledDependencies[id]
    );
  })(),
});

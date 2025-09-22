var core_default = (middlewares, handlers, children) => [
  middlewares,
  handlers,
  ,
  children,
];
let macro$1 = (f) => [-1, f],
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
  json$1 = (() => {
    let jsonHeader = injectDependency('["content-type","application/json"]'),
      jsonOptions = injectDependency('{headers:[' + jsonHeader + ']}');
    return (res, hasContext) =>
      hasContext
        ? 'h.push(' +
          jsonHeader +
          ');return new Response(JSON.stringify(' +
          res +
          '),c)'
        : 'return new Response(JSON.stringify(' +
          res +
          '),' +
          jsonOptions +
          ')';
  })(),
  text =
    ((() => {
      let htmlHeader = injectDependency('["content-type","text/html"]');
      injectDependency('{headers:[' + htmlHeader + ']}');
    })(),
    (res, hasContext) =>
      'return new Response(' + res + (hasContext ? ',c)' : ')')),
  _ = Symbol.for('@safe-std/error'),
  isErr = (u) => Array.isArray(u) && u[0] === _,
  IS_ERR$1 = ((e = isErr), '__' + persistentDependencies.push(e));
var e;
let compileHandlerHook,
  compileErrorHandlerHook,
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
let macro = (f) => [-1, f],
  externalDependencies$1 = (macro(() => ''), []),
  clearErrorHandler =
    (((e) => {
      externalDependencies$1.push(e);
    })(isErr),
    (scope) => {
      null != scope[2] && (scope[3] = null);
    }),
  optimizeDirectCall =
    (macro(
      (scope) => (scope[1] || ((scope[1] = !0), clearErrorHandler(scope)), ''),
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
  compileToFn = (t, deps) => 'o=>' + compile$1(t, 'o', deps, !1),
  compile$1 = (t, i, deps, optional) => {
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
        for (const key in o) str += '&&' + compile$1(o[key], i + key, deps, !1);
      }
      if (null != t[2]) {
        let o = t[2];
        for (const key in o) str += '&&' + compile$1(o[key], i + key, deps, !0);
      }
    } else if (18 === id) {
      let list = t[1];
      str += 'Array.isArray(' + i + ')&&' + i + '.length===' + list.length;
      for (let j = 0; j < list.length; j++)
        str += '&&' + compile$1(list[j], i + '[' + j + ']', deps, !1);
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
              (str += compile$1(o[key$1], i + key$1, deps, !1));
        }
        if (null != schema[2]) {
          let o = schema[2];
          for (const key$1 in o)
            first && ((first = !1), (str += '&&')),
              (str += compile$1(o[key$1], i + key$1, deps, !0));
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
let bodyErr = ((u = parserTag), (d) => [_, d, u])('malformed body'),
  ERROR_DEP = injectExternalDependency(bodyErr),
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
      '/api': core_default(
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
        [['POST', '/body', (c) => c.body, { type: json$1 }]],
      ),
    },
  );
let compile = (node, paramCount, idx, idxPrefix) => {
  let builder = '{',
    noStore = null == node[1],
    partLen = node[0].length,
    currentIdx = idxPrefix + (idx + partLen);
  if (partLen > 1) {
    let start = idxPrefix + (idx + 1);
    builder =
      2 === partLen
        ? 'if(l' +
          (noStore ? '>' : '>=') +
          currentIdx +
          ')if(p[' +
          start +
          ']==="' +
          node[0][1] +
          '"){'
        : (noStore ? 'if(l>' + currentIdx + ')if(' : 'if(') +
          'p.startsWith("' +
          node[0].slice(1) +
          '",' +
          start +
          ')){';
  } else noStore && (builder = 'if(l>' + currentIdx + '){');
  if (
    ((idx += partLen),
    noStore || (builder += 'if(l===' + currentIdx + '){' + node[1] + '}'),
    null != node[2])
  ) {
    let childrenEntries = Object.entries(node[2]);
    for (let i = 0; i < childrenEntries.length; i++)
      builder +=
        (0 !== i ? 'else if(' : 'if(') +
        'p[' +
        currentIdx +
        ']==="' +
        String.fromCharCode(+childrenEntries[i][0]) +
        '"){' +
        compile(childrenEntries[i][1], paramCount, idx, idxPrefix) +
        '}';
  }
  if (null != node[3]) {
    let params = node[3],
      hasStore = null != params[1],
      hasChild = null != params[0];
    paramCount > 0 &&
      ((builder += 'let i=' + currentIdx + ';'), (currentIdx = 'i'));
    let slashIndex =
      'p.indexOf("/"' + ('0' === currentIdx ? '' : ',' + currentIdx) + ')';
    (!hasChild && hasStore) ||
      ((builder += (paramCount > 0 ? '' : 'let ') + 'j=' + slashIndex + ';'),
      (slashIndex = 'j')),
      hasStore &&
        (builder +=
          'if(' +
          slashIndex +
          '===-1){let q' +
          paramCount +
          '=' +
          ('0' === currentIdx ? 'p' : 'p.slice(' + currentIdx + ')') +
          ';' +
          params[1] +
          '}'),
      hasChild &&
        (builder +=
          (hasStore ? 'else if(' : 'if(') +
          'j>' +
          currentIdx +
          '){let q' +
          paramCount +
          '=p.slice(' +
          currentIdx +
          ',j);' +
          compile(params[0], paramCount + 1, 0, 'j+') +
          '}');
  }
  return (
    null == node[4] ||
      (builder +=
        'let q' +
        paramCount +
        '=' +
        ('0' === currentIdx ? 'p' : 'p.slice(' + currentIdx + ')') +
        ';' +
        node[4]),
    builder + '}'
  );
};
var compiler_default$1 = (router, startIndex) => {
  let str = '';
  for (let i = 0, pairs = router[0]; i < pairs.length; i++)
    str +=
      ('' === str ? 'if(' : 'else if(') +
      'p==="' +
      pairs[i][0].slice(startIndex) +
      '"){' +
      pairs[i][1] +
      '}';
  return (
    str +
    (null == router[1]
      ? ''
      : '{let l=p.length;' + compile(router[1], 0, -startIndex, '') + '}')
  );
};
let URL_ROUTER,
  createNode = (part) => [part, , , , ,],
  createParamNode = (nextNode) => [nextNode, ,],
  cloneNode = (node, part) => [part, node[1], node[2], node[3], node[4]],
  resetNode = (node, part, children) => {
    (node[0] = part),
      (node[2] = children),
      (node[1] = node[3] = node[4] = void 0);
  },
  visitNode = (node, parts) => {
    for (let i = 0; i < parts.length; ++i) {
      let pathPart = parts[i];
      if (0 !== i)
        if (null == node[3]) {
          let nextNode = createNode(pathPart);
          (node[3] = createParamNode(nextNode)), (node = nextNode);
        } else node = node[3][0] ??= createNode(pathPart);
      for (let j = 0; ; ++j) {
        let nodePart = node[0];
        if (j === pathPart.length) {
          if (j < nodePart.length) {
            let children = [];
            (children[nodePart.charCodeAt(j)] = cloneNode(
              node,
              nodePart.slice(j),
            )),
              resetNode(node, pathPart, children);
          }
          break;
        }
        if (j === nodePart.length) {
          if (null == node[2]) node[2] = [];
          else {
            let nextNode$1 = node[2][pathPart.charCodeAt(j)];
            if (null != nextNode$1) {
              (node = nextNode$1), (pathPart = pathPart.slice(j)), (j = 0);
              continue;
            }
          }
          let nextNode = createNode(pathPart.slice(j));
          (node[2][pathPart.charCodeAt(j)] = nextNode), (node = nextNode);
          break;
        }
        if (pathPart[j] !== nodePart[j]) {
          let children = [];
          children[nodePart.charCodeAt(j)] = cloneNode(node, nodePart.slice(j));
          let nextNode = createNode(pathPart.slice(j));
          (children[pathPart.charCodeAt(j)] = nextNode),
            resetNode(node, nodePart.substring(0, j), children),
            (node = nextNode);
          break;
        }
      }
    }
    return node;
  },
  insertItem = (router, method, path, item) => {
    ((router, path, item) => {
      path.includes('*')
        ? ((node, path, item) => {
            path.endsWith('*')
              ? '*' === path[path.length - 2]
                ? (visitNode(node, path.slice(0, -2).split('*'))[4] = item)
                : ((visitNode(node, path.slice(0, -1).split('*'))[3] ??= [
                    ,
                    ,
                  ])[1] = item)
              : (visitNode(node, path.split('*'))[1] = item);
          })((router[1] ??= createNode('/')), path, item)
        : router[0].push([path, item]);
    })((router[method] ??= [[], ,]), path, item);
  },
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
  };
var target_any_jit__built__default = {
  fetch: (() => {
    let id = ((e) => ((exportedDeps += e + ','), exportedDepsCnt++))(
      injectDependency(
        (((router) => {
          var fn;
          (URL_ROUTER = {}),
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
                  ? insertItem(
                      URL_ROUTER,
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
                  : insertItem(
                      URL_ROUTER,
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
            (contextInit = 'let h=[],c={status:200,req:r,headers:h};'),
            compileGroup(router, [!1, !1, , 'return ' + RES400, !1], '', '');
        })(main_default),
        '(r)=>{' +
          ((router, methodInput, parsePath) => {
            let allRouter = router[''],
              str = '';
            for (let key in router)
              '' !== key &&
                (str +=
                  ('' === str ? 'if(' : 'else if(') +
                  'r.method==="' +
                  key +
                  '"){' +
                  (null == allRouter ? parsePath : '') +
                  compiler_default$1(router[key], 1) +
                  '}');
            return null == allRouter
              ? str
              : parsePath + str + compiler_default$1(allRouter, 1);
          })(
            URL_ROUTER,
            0,
            'let u=r.url,s=u.indexOf("/",12)+1,e=u.indexOf("?",s),p=e===-1?u.slice(s):u.slice(s,e);',
          ) +
          'return ' +
          RES404 +
          '}'),
      ),
    );
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
};
export { target_any_jit__built__default as default };

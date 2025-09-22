import { injectDependency } from 'runtime-compiler';
import { RES404 } from '../jit.js';

let ROUTES: Record<string, Record<string, string>>;

export const resetRouter = (): void => {
  ROUTES = {};
};

export const insertRoute = (method: string, path: string, content: string): void => {
  const isWildcard = path.endsWith('**');

  let i = 0;
  const bunPattern = isWildcard
    ? path.slice(-2).replace(/\*/g, () => ':' + constants.PARAMS + i++) + '*'
    : path.replace(/\*/g, () => ':' + constants.PARAMS + i++);

  // Wrap in a function
  let str = constants.BUN_FN_START + '{';
  if (i > 0) {
    // Assign variables to params
    str += 'let {' + constants.PARAMS + '0';
    for (let j = 1, l = i - (isWildcard ? 1 : 0); j < l; j++)
      str += constants.PARAMS + ',' + j;
    str +=
      '}=' +
      constants.REQ +
      '.params' +
      (isWildcard
        ? ',' + constants.PARAMS + i + '=' + constants.REQ + '.params["*"];'
        : ';');
  }
  (ROUTES![bunPattern] ??= {})[method] = str + content + '}';

  // Add a 404 to any other method to deoptimize if method is not a passable method to Bun
  // https://bun.com/docs/api/http#per-http-method-routes
  if (
    method !== 'GET' &&
    method !== 'HEAD' &&
    method !== 'OPTIONS' &&
    method !== 'DELETE' &&
    method !== 'PATCH' &&
    method !== 'POST' &&
    method !== 'PUT'
  )
    ROUTES![bunPattern][''] ??= RES404;

  // Compatible with @mapl/router
  if (isWildcard)
    (ROUTES![bunPattern === '/*' ? '/' : bunPattern.slice(0, -3)] ??= {})[
      method
    ] ??= RES404;
};

export const routerToString = (): string => {
  let str = '{';
  for (const pattern in ROUTES) {
    str += '"' + pattern + '":';

    const methods = ROUTES[pattern];
    if (methods[''] == null) {
      str += '{';
      for (const method in methods) str += method + ':' + methods[method] + ',';
      str += '},';
    } else if (Object.keys(methods).length === 0)
      str += methods[''] + ',';
    else {
      str += constants.BUN_FN_START;

      // Check methods
      for (const method in methods) {
        if (method !== '') {
          const fn = methods[method];
          str +=
            constants.REQ +
            '.method==="' +
            method +
            '"?' +
            (fn.startsWith(constants.BUN_FN_START)
              ? injectDependency(fn) + constants.BUN_FN_ARGS
              : fn) +
            ':';
        }
      }

      // Last check for other methods
      const fn = methods[''];
      str +=
        (fn.startsWith(constants.BUN_FN_START)
          ? injectDependency(fn) + constants.BUN_FN_ARGS
          : fn) + ',';
    }
  }
  return str + '}';
};

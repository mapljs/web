let METHOD_ROUTER: Record<string, Record<string, string>>;
let DEOPT_PATHS: string[];

export const initRouter = (): void => {
  METHOD_ROUTER = {};
  DEOPT_PATHS = [];
};

/**
 * Path and content must be processed before inserting
 * @param method
 * @param path
 * @param content
 */
export const insertItem = (
  method: string,
  path: string,
  content: string,
): void => {
  let methods = METHOD_ROUTER[path];
  if (methods != null) methods[''] == null && DEOPT_PATHS.push(path);
  else methods = METHOD_ROUTER[path] = {};

  method !== 'GET' &&
    method !== 'POST' &&
    method !== 'PUT' &&
    method !== 'DELETE' &&
    method !== 'PATCH' &&
    method !== 'OPTIONS' &&
    DEOPT_PATHS.push(path);

  methods[method] = content;
};

export const toRoutes = (): string => {
  let str = '{';

  for (let i = 0; i < DEOPT_PATHS.length; i++) {
    let back = 'return ' + constants.RES_404 + '},';

    const path = DEOPT_PATHS[i];
    str += '"' + path + '":' + constants.BUN_DENO_ARGS + '=>{';

    const methods = METHOD_ROUTER[path];
    delete METHOD_ROUTER[path];

    let first = true;
    for (const method in methods) {
      if (method === '') back = methods[''] + '},';
      else {
        if (first) {
          first = false;
          str += 'if(';
        } else str += 'else if(';

        str +=
          constants.REQ +
          '.method==="' +
          method +
          '"){' +
          methods[method] +
          '}';
      }
    }

    str += back;
  }

  for (const path in METHOD_ROUTER) {
    str += '"' + path;

    const methods = METHOD_ROUTER[path];
    if (methods[''] == null) {
      str += '":{';
      for (const method in methods)
        str +=
          method +
          ':' +
          constants.BUN_DENO_ARGS +
          '=>{' +
          methods[method] +
          '},';
      str += '},';
    } else str += '":' + constants.BUN_DENO_ARGS + '=>{' + methods[''] + '},';
  }

  return str + '}';
};

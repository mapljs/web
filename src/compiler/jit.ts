import {
  compileGroup,
  createArgSet,
  AsyncFunction,
  setHooks,
  contextInit,
  setContextInit,
  wrapAsync,
} from '@mapl/framework';

import compile from '@mapl/router/method/compiler';
import { countParams } from '@mapl/router/path';
import { insertItem, type Router } from '@mapl/router/method';

import type { RouterTag } from '../core/index.js';
import type { HandlerData } from '../core/handler.js';

import {
  exportDependency,
  getDependency,
  injectDependency,
  injectExternalDependency,
  type CompiledDependency,
} from 'runtime-compiler';
import { evaluate, evaluateSync } from 'runtime-compiler/jit';

// Compiled values are loaded to the URL router
let URL_ROUTER: Router<string>;
export const RES404: string = injectDependency(
  'new Response(null,{status:404})',
);
export const RES400: string = injectDependency(
  'new Response(null,{status:400})',
);

const paramArgs: string[] = createArgSet(
  new Array(16).fill(0).map((_1, i) => constants.PARAMS + i),
);

const compileReturn = (
  dat: HandlerData,

  fnAsync: boolean,
  scopeAsync: boolean,
  contextCreated: boolean,
  result: string,
): string => {
  const res = dat?.type;
  if (res == null) return 'return ' + result;

  const str = res(fnAsync ? 'await ' + result : result, contextCreated);
  return fnAsync && !scopeAsync
    ? constants.ASYNC_START + str + constants.ASYNC_END
    : str;
};

const compileToState = (router: RouterTag): void => {
  URL_ROUTER = {}; // Create base router

  setHooks({
    compileHandler: (handler, prevContent, path, scope) => {
      const fn = handler[2];
      // String builders
      let call = injectExternalDependency(fn) + '(';

      // Load parameter args from subpath
      const paramCount = countParams(handler[1]);
      paramCount > 0 && (call += paramArgs[paramCount]);

      // Load other args
      if (fn.length > paramCount) {
        call += paramCount === 0 ? constants.CTX : ',' + constants.CTX;

        // Create context to pass in the function
        if (!scope[1]) {
          insertItem(
            URL_ROUTER,
            handler[0],
            path,
            prevContent +
              contextInit +
              compileReturn(
                handler[3] as HandlerData,
                fn instanceof AsyncFunction,
                scope[0],
                true,
                call + ')',
              ) +
              (scope[0] ? constants.ASYNC_END : ''),
          );

          return;
        }
      }

      insertItem(
        URL_ROUTER,
        handler[0],
        path,
        prevContent +
          compileReturn(
            handler[3] as HandlerData,
            fn instanceof AsyncFunction,
            scope[0],
            scope[1],
            call + ')',
          ) +
          (scope[0] ? constants.ASYNC_END : ''),
      );
    },
    compileErrorHandler: (input, fn, dat, scope) => {
      // String builders
      let call = injectExternalDependency(fn) + '(' + input;

      // Load other args
      if (fn.length > 1) {
        call += ',' + constants.CTX;

        // Create context to pass in the function
        if (!scope[1])
          return (
            contextInit +
            compileReturn(
              dat as HandlerData,
              fn instanceof AsyncFunction,
              scope[0],
              true,
              call + ')',
            )
          );
      }

      return compileReturn(
        dat as HandlerData,
        fn instanceof AsyncFunction,
        scope[0],
        scope[1],
        call + ')',
      );
    },
  });

  // Set context initial statement
  setContextInit(constants.CTX_INIT);

  compileGroup(
    router as any,
    [false, false, , 'return ' + RES400, false],
    '',
    '',
  );
};

export const compileToString = (router: RouterTag): string => {
  compileToState(router);
  return (
    '(' +
    constants.REQ +
    ')=>{' +
    compile(URL_ROUTER, constants.REQ + '.method', constants.PARSE_PATH, 1) +
    'return ' +
    RES404 +
    '}'
  );
};

export const compileToExportedDependency = (
  router: RouterTag,
): CompiledDependency<(req: Request) => any> =>
  exportDependency(injectDependency('(' + compileToString(router) + ')()'));

export const compileToHandler = async (
  router: RouterTag,
): Promise<(req: Request) => any> => {
  const id = compileToExportedDependency(router);
  await evaluate();
  return getDependency(id);
};

export const compileToHandlerSync = (
  router: RouterTag,
): ((req: Request) => any) => {
  const id = compileToExportedDependency(router);
  evaluateSync();
  return getDependency(id);
};

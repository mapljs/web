import {
  compileGroup,
  createArgSet,
  AsyncFunction,
  setHooks,
  contextInit,
  setContextInit,
} from '@mapl/framework';

import compile from '@mapl/router/method/compiler';
import { countParams } from '@mapl/router/path';
import { insertItem, type Router } from '@mapl/router/method';

import type { RouterTag } from '../core/index.js';
import type { HandlerData } from '../core/handler.js';

import {
  getDependency,
  injectDependency,
  injectExternalDependency,
  type CompiledDependency,
} from 'runtime-compiler';
import { evaluate, evaluateSync } from 'runtime-compiler/jit';

// Compiled values are loaded to the URL router
let urlRouter: Router<string>;

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
  const typ = dat.type;
  if (typ === 'raw') return 'return ' + result;
  fnAsync && (result = 'await ' + result);

  const str =
    typ == null
      ? 'return new Response(' +
        result +
        (contextCreated ? ',' + constants.CTX + ')' : ')')
      : contextCreated
        ? constants.CTX +
          '.headers.push(' +
          (typ === 'json' ? constants.CJSON : constants.CHTML) +
          ');return new Response(' +
          (typ === 'json' ? 'JSON.stringify(' + result + ')' : result) +
          ',' +
          constants.CTX +
          ')'
        : 'return new Response(' +
          (typ === 'json'
            ? 'JSON.stringify(' + result + '),' + constants.OJSON
            : result + ',' + constants.OHTML) +
          ')';

  // Must manually wrap if scope was not async yet
  return fnAsync && !scopeAsync
    ? constants.ASYNC_START + str + constants.ASYNC_END
    : str;
};

const compileToState = (router: RouterTag): void => {
  urlRouter = {}; // Create base router

  setHooks({
    compileHandler: (fn, dat, path, scope) => {
      // String builders
      let call = injectExternalDependency(fn) + '(';

      // Load parameter args
      const paramCount = countParams(path);
      paramCount > 0 && (call += paramArgs[paramCount]);

      // Load other args
      if (fn.length > paramCount) {
        call += paramCount === 0 ? constants.CTX : ',' + constants.CTX;

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
    compileErrorHandler: (fn, dat, scope) => {
      // String builders
      let call = injectExternalDependency(fn) + '(' + constants.TMP;

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
    registerCompiled: (method, path, content) =>
      insertItem(urlRouter, method, path, content),
  });

  // Set context initial statement
  setContextInit(constants.CTX_INIT);

  compileGroup(
    router as any,
    [false, false, , 'return ' + constants.R400, false],
    '',
    '',
  );
};

export const compileToString = (router: RouterTag): string => {
  compileToState(router);
  return (
    '()=>{' +
    constants.GLOBALS +
    'return(' +
    constants.REQ +
    ')=>{' +
    compile(urlRouter, constants.REQ + '.method', constants.PARSE_PATH, 1) +
    'return ' +
    constants.R404 +
    '}}'
  );
};

export const compileToDependency = (
  router: RouterTag,
): CompiledDependency<(req: Request) => any> =>
  injectDependency('(' + compileToString(router) + ')()');

export const compileToHandler = async (
  router: RouterTag,
): Promise<(req: Request) => any> => {
  const id = compileToDependency(router);
  await evaluate();
  return getDependency(id);
};

export const compileToHandlerSync = (
  router: RouterTag,
): ((req: Request) => any) => {
  const id = compileToDependency(router);
  evaluateSync();
  return getDependency(id);
};

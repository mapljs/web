import {
  compileGroup,
  AsyncFunction,
  contextInit,
  setContextInit,
  setCompileErrorHandlerHook,
  setCompileHandlerHook,
} from '@mapl/framework';

import { countParams } from '@mapl/router/path';

import type { RouterTag } from '../../core/index.js';
import type { HandlerData } from '../../core/handler.js';

import {
  exportDependency,
  getDependency,
  injectDependency,
  injectExternalDependency,
  type CompiledDependency,
} from 'runtime-compiler';
import { evaluate, evaluateSync } from 'runtime-compiler/jit';

import { compileErrorHandler, compileReturn, paramArgs, RES400 } from '../jit.js';
import { insertRoute, resetRouter, routerToString } from './router.js';
import type { FetchFn } from '../../core/utils.js';

export type BunRoutes = Record<string, Record<string, FetchFn> | FetchFn>;

const compileToState = (router: RouterTag): void => {
  resetRouter();

  setCompileHandlerHook((handler, prevContent, path, scope) => {
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
        insertRoute(
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

    insertRoute(
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
  });

  setCompileErrorHandlerHook(compileErrorHandler);

  // Set context initial statement
  setContextInit(
    'let ' +
      constants.HEADERS +
      '=[],' +
      constants.CTX +
      '={status:200,req:' +
      constants.REQ +
      ',server:' +
      constants.SERVER_INFO +
      ',headers:' +
      constants.HEADERS +
      '};',
  );

  compileGroup(
    router as any,
    [false, false, , 'return ' + RES400, false],
    '',
    '',
  );
};

export const compileToString = (router: RouterTag): string => {
  compileToState(router);
  return routerToString();
};

export const compileToExportedDependency = (
  router: RouterTag,
): CompiledDependency<BunRoutes> =>
  exportDependency(injectDependency(compileToString(router)));

export const compileToHandler = async (
  router: RouterTag,
): Promise<BunRoutes> => {
  const id = compileToExportedDependency(router);
  await evaluate();
  return getDependency(id);
};

export const compileToHandlerSync = (
  router: RouterTag,
): BunRoutes => {
  const id = compileToExportedDependency(router);
  evaluateSync();
  return getDependency(id);
};

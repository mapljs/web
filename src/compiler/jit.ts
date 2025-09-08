import {
  compileGroup,
  createArgSet,
  AsyncFunction,
  compilerState as state,
} from '@mapl/framework';

import compile from '@mapl/router/method/compiler';
import { countParams } from '@mapl/router/path';
import { isErr } from '@safe-std/error';

import type { RouterTag } from '../core/index.js';
import type { HandlerData } from '../core/handler.js';
import createContext from '../core/context.js';

import config from '@mapl/framework/config';
// @ts-expect-error No hydration for JIT
config.hydrateDependency = false;

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

const compileHandler: (typeof state)[3] = (fn, dat, path, scope) => {
  // String builders
  let call = constants.DEP + state[1].push(fn) + '(';

  // Load parameter args
  const paramCount = countParams(path);
  paramCount > 0 && (call += paramArgs[paramCount]);

  // Load other args
  if (fn.length > paramCount) {
    call += paramCount === 0 ? constants.CTX : ',' + constants.CTX;

    // Create context to pass in the function
    if (!scope[1])
      return (
        state[2] +
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
};

const compileErrorHandler: (typeof state)[4] = (fn, dat, scope) => {
  // String builders
  let call = constants.DEP + state[1].push(fn) + '(' + constants.TMP;

  // Load other args
  if (fn.length > 1) {
    call += ',' + constants.CTX;

    // Create context to pass in the function
    if (!scope[1])
      return (
        state[2] +
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
};

const compileToState = (router: RouterTag): void => {
  state[0] = {}; // Create base router
  state[1] = []; // Assign dependencies
  state[2] = constants.CTX_INIT;
  state[3] = compileHandler;
  state[4] = compileErrorHandler;

  compileGroup(
    router as any,
    [false, false, , 'return ' + constants.R400, false],
    '',
    '',
  );
};

const stateToString = (): string =>
  '"use strict";' +
  constants.GLOBALS +
  ';return(' +
  constants.REQ +
  ')=>{' +
  compile(state[0], constants.REQ + '.method', constants.PARSE_PATH, 1) +
  'return ' +
  constants.R404 +
  '}';

const stateToArgs = (): string => {
  let depsString = constants.IS_ERR + ',' + constants.CTX_FN;

  const deps = state[1];
  for (let i = 0; i < deps.length; i++)
    depsString += ',' + constants.DEP + (i + 1);

  return depsString;
};

export const compileToString = (router: RouterTag): string => {
  compileToState(router);
  return '(' + stateToArgs() + ')=>{' + stateToString() + '}';
};

export const compileToHandler = (router: RouterTag): ((req: Request) => any) => {
  compileToState(router);

  return Function(stateToArgs(), stateToString())(
    isErr,
    createContext,
    ...state[1],
  );
};

import { compileGroup, createArgSet, isFuncAsync, selectArgs, type CompilerState } from '@mapl/framework';

import type { Router } from '@mapl/router/method';
import { o2 } from '@mapl/router/tree/compiler';
import compile from '@mapl/router/method/compiler';

import type { AnyRouter } from '..';
import type { Data, ErrorFunc, HandlerData, HandlerFunc } from '../handler';
import { transformRoute } from '@mapl/router/transform';
import { isErr } from 'safe-throw';
import { createContext } from '../context';

type State = CompilerState<ErrorFunc, HandlerFunc, HandlerData>;

const paramArgs: string[] = createArgSet(new Array(16).fill(0).map((_1, i) => constants.PARAMS + i));

const compileReturn = (state: State, dat: Data, wrapAsync: boolean, contextCreated: boolean, result: string): string => {
  const typ = dat.type;
  // Basic types
  return typ == null
    ? 'return new Response(' + result + (contextCreated ? ',' + constants.CTX + ');' : ');')
    : typ === 'raw'
      ? 'return ' + result + ';'
      // Other type
      : (wrapAsync
        ? constants.ASYNC_START
        : ''
      ) + (contextCreated
        ? ''
        : state[3]
      ) + constants.HEADERS + '.push(' + (typ === 'json'
        ? constants.CJSON
        : constants.CHTML
      ) + ');return new Response(' + (
        typ === 'json'
          ? 'JSON.stringify(' + result + ')'
          : result
      ) + ',' + constants.CTX + ');' + (wrapAsync
        ? constants.ASYNC_END
        : ''
      );
};

const compileHandler: State[4] = (fn, dat, path, state, scopeAsync, contextCreated) => {
  // String builders
  let wrapAsync = false;
  let call = constants.DEP + state[1].push(fn) + '(';

  if (isFuncAsync(fn)) {
    call = 'await ' + call;
    // Need wrapping when the scope contains await and is not async
    wrapAsync = !scopeAsync;
  }

  // Load parameter args
  const paramCount = path[0].length;
  if (paramCount > 0)
    call += paramArgs[paramCount];

  // Load other args
  if (fn.length > paramCount) {
    if (paramCount > 0)
      call += ',';
    call += selectArgs(state[2], fn.length - paramCount);

    // Create context to pass in the function
    if (!contextCreated) {
      contextCreated = true;
      call = state[3] + call;
    }
  }

  return compileReturn(state, dat, wrapAsync, contextCreated, call + ')');
};

const compileErrorHandler: State[5] = (fn, dat, state, scopeAsync, contextCreated) => {
  // String builders
  let wrapAsync = false;
  let call = constants.DEP + state[1].push(fn) + '(' + constants.ERR;

  if (isFuncAsync(fn)) {
    call = 'await ' + call;
    // Need wrapping when the scope contains await and is not async
    wrapAsync = !scopeAsync;
  }

  // Load other args
  if (fn.length > 1) {
    call += ',' + selectArgs(state[2], fn.length - 1);

    // Create context to pass in the function
    if (!contextCreated) {
      contextCreated = true;
      call = state[3] + call;
    }
  }

  return compileReturn(state, dat, wrapAsync, contextCreated, call + ')');
};

export default (router: AnyRouter, args: string[]): (req: Request) => any => {
  const baseRouter: Router<string> = {};
  const dependencies: any[] = [];

  compileGroup(
    router.group,
    [
      baseRouter,
      dependencies,
      createArgSet([constants.CTX, ...args]),
      constants.CTX_INIT,
      compileHandler,
      compileErrorHandler,
      transformRoute
    ],
    '',
    '',
    false,
    false,
    // Fallback error handler
    'return ' + constants.R400 + ';'
  );

  return Function(
    constants.IS_ERR,
    constants.CTX_FN,
    ...dependencies.map((_, i) => constants.DEP + (i + 1)),
    constants.GLOBALS + 'return (' + constants.REQ + ')=>{' + compile(baseRouter, o2, constants.REQ + '.method', constants.PARSE_PATH, 1) + 'return ' + constants.R404 + '}'
  )(
    isErr,
    createContext,
    ...dependencies
  );
};

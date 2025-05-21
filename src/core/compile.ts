import {
  compileGroup,
  createArgSet,
  isFuncAsync,
  type CompilerState,
} from '@mapl/framework';

import type { Router } from '@mapl/router/method/index.js';
import { o2 } from '@mapl/router/tree/compiler.js';
import compile from '@mapl/router/method/compiler.js';
import { countParams } from '@mapl/router/path/index.js';
import { isErr } from 'safe-throw';

import type { AnyRouter } from './index.js';
import type { HandlerData } from './handler.js';
import createContext from './context.js';

const paramArgs: string[] = createArgSet(
  new Array(16).fill(0).map((_1, i) => constants.PARAMS + i),
);

const compileReturn = (
  state: CompilerState,
  dat: HandlerData,

  fnAsync: boolean,
  scopeAsync: boolean,
  contextCreated: boolean,
  result: string,
): string => {
  const typ = dat.type;

  if (typ === 'raw') return 'return ' + result;

  if (fnAsync) result = 'await ' + result;

  const str =
    typ == null
      ? 'return new Response(' +
        result +
        (contextCreated ? ',' + constants.CTX + ')' : ')')
      : (contextCreated ? '' : state[2]) +
        constants.HEADERS +
        '.push(' +
        (typ === 'json' ? constants.CJSON : constants.CHTML) +
        ');return new Response(' +
        (typ === 'json' ? 'JSON.stringify(' + result + ')' : result) +
        ',' +
        constants.CTX +
        ')';

  return fnAsync && !scopeAsync
    ? constants.ASYNC_START + str + constants.ASYNC_END
    : scopeAsync
      ? str + constants.ASYNC_END
      : str;
};

export default (router: AnyRouter): ((req: Request) => any) => {
  const baseRouter: Router<string> = {};
  const dependencies: any[] = [];

  compileGroup(
    router as any,
    [
      baseRouter,
      dependencies,
      constants.CTX_INIT,

      (fn, dat, path, state, scope) => {
        // String builders
        let call = constants.DEP + state[1].push(fn) + '(';

        // Load parameter args
        const paramCount = countParams(path);
        if (paramCount > 0) call += paramArgs[paramCount];

        // Load other args
        if (fn.length > paramCount) {
          call += paramCount === 0 ? constants.CTX : ',' + constants.CTX;

          // Create context to pass in the function
          if (!scope[1])
            return (
              state[2] +
              compileReturn(
                state,
                dat as HandlerData,
                isFuncAsync(fn),
                scope[0],
                true,
                call + ')',
              )
            );
        }

        return compileReturn(
          state,
          dat as HandlerData,
          isFuncAsync(fn),
          scope[0],
          scope[1],
          call + ')',
        );
      },

      (fn, dat, state, scope) => {
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
                state,
                dat as HandlerData,
                isFuncAsync(fn),
                scope[0],
                true,
                call + ')',
              )
            );
        }

        return compileReturn(
          state,
          dat as HandlerData,
          isFuncAsync(fn),
          scope[0],
          scope[1],
          call + ')',
        );
      },
    ],
    [
      false,
      false,
      null,
      // Fallback error handler
      'return ' + constants.R400,
    ],
    '',
    '',
  );

  return Function(
    constants.IS_ERR,
    constants.CTX_FN,
    ...dependencies.map((_, i) => constants.DEP + (i + 1)),
    constants.GLOBALS +
      'return(' +
      constants.REQ +
      ')=>{' +
      compile(
        baseRouter,
        o2,
        constants.REQ + '.method',
        constants.PARSE_PATH,
        1,
      ) +
      'return ' +
      constants.R404 +
      '}',
  )(isErr, createContext, ...dependencies);
};

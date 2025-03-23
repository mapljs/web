import { buildFunc, compileGroup, createArgSet, isFuncAsync, selectArgs, type CompilerState } from '@mapl/framework';

import type { Router } from '@mapl/router/method';
import { o2 } from '@mapl/router/tree/compiler';
import compile from '@mapl/router/method/compiler';

import type { AnyRouter } from '..';
import type { ErrorFunc, HandlerData, HandlerFunc } from '../handler';

type State = CompilerState<ErrorFunc, HandlerFunc, HandlerData>;

const paramArgs: string[] = createArgSet(new Array(16).fill(0).map((_1, i) => constants.PARAMS + i));

const compileHandler: State[4] = (data, state, scopeAsync, contextCreated) => {
  const fn = data[2];
  const dat = data[3];

  // String builders
  let str = '';
  let call = constants.DEP + state[1].push(fn) + '(';
  {
    // Load parameter args
    const paramCount = data[1][0].length;
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
        str += state[3];
      }
    }
  }
  call += ')';

  {
    const typ = dat.type;

    if (typ == null) {
      return str + 'return new Response(' + call + (
        contextCreated ? ',' + constants.CTX + ');' : ');'
      );
    }

    if (typ === 'raw')
      return str + 'return ' + call + ';';

    // Create context to pass in the Response
    if (!contextCreated) str += state[3];

    // Wrap in an async scope when necessary
    let append = '';
    if (isFuncAsync(fn)) {
      call = 'await ' + call;
      if (!scopeAsync) {
        str += constants.ASYNC_START;
        append = constants.ASYNC_END;
      }
    }

    str += constants.HEADERS + '.push(' + (typ === 'json'
      ? constants.CJSON
      : constants.CHTML
    ) + ');return new Response(' + (
      typ === 'json'
        ? 'JSON.stringify(' + call + ')'
        : call
    ) + ',' + constants.CTX + ');' + append;
  }

  return str;
};

const compileErrorHandler: State[5] = (data, state, scopeAsync, contextCreated) => {
  const fn = data[0];
  const dat = data[1];

  // String builders
  let str = '';
  let call = constants.DEP + state[1].push(fn) + '(' + constants.ERR;
  // Load other args
  if (fn.length > 1) {
    call += ',' + selectArgs(state[2], fn.length - 1);

    // Create context to pass in the function
    if (!contextCreated) {
      contextCreated = true;
      str += state[3];
    }
  }
  call += ')';

  {
    const typ = dat.type;

    if (typ == null) {
      return str + 'return new Response(' + call + (
        contextCreated ? ',' + constants.CTX + ');' : ');'
      );
    }

    if (typ === 'raw')
      return str + 'return ' + call + ';';

    // Create context to pass in the Response
    if (!contextCreated) str += state[3];

    // Wrap in an async scope when necessary
    let append = '';
    if (isFuncAsync(fn)) {
      call = 'await ' + call;
      if (!scopeAsync) {
        str += constants.ASYNC_START;
        append = constants.ASYNC_END;
      }
    }

    str += constants.HEADERS + '.push(' + (typ === 'json'
      ? constants.CJSON
      : constants.CHTML
    ) + ');return new Response(' + (
      typ === 'json'
        ? 'JSON.stringify(' + call + ')'
        : call
    ) + ',' + constants.CTX + ');' + append;
  }

  return str;
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
      compileErrorHandler
    ],
    '',
    '',
    false,
    false,
    ''
  );

  return buildFunc(constants.GLOBALS + 'return (' + constants.REQ + ')=>{' + compile(baseRouter, o2, constants.REQ + '.method', constants.PARSE_PATH, 1) + '}', dependencies);
};

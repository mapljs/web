import { hydrateDependency, compilerState as state } from '@mapl/framework';

import { isErr } from '@safe-std/error';

import type { RouterTag } from '../core/index.js';
import createContext from '../core/context.js';

const compileHandler: (typeof state)[3] = (fn) => {
  state[1].push(fn);
  return '';
};

const compileErrorHandler: (typeof state)[4] = (fn) => {
  constants.DEP + state[1].push(fn) + '(' + constants.TMP;
  return '';
};

export default (router: RouterTag): any[] => {
  state[0] = {}; // Create base router
  state[1] = []; // Assign dependencies
  state[2] = constants.CTX_INIT;
  state[3] = compileHandler;
  state[4] = compileErrorHandler;

  hydrateDependency(
    router as any,
    [false, false, , '', false],
    '',
  );

  return [isErr, createContext].concat(state[1]);
};

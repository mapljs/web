import {
  hydrateDependency,
  externalDependencies,
  setHooks,
} from '@mapl/framework';
import { isErr } from '@safe-std/error';

import type { RouterTag } from '../core/index.js';
import createContext from '../core/context.js';

export default (router: RouterTag): any[] => {
  externalDependencies.length = 0;

  const hook = (fn: any) => {
    externalDependencies.push(fn);
    return '';
  };
  setHooks({
    compileHandler: hook,
    compileErrorHandler: hook,
  });

  hydrateDependency(router as any, [false, false, , '', false], '');

  return [isErr, createContext].concat(externalDependencies);
};

import {
  declareLocal,
  injectExternal,
  type Identifier,
} from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';
import { AsyncFunction } from 'runtime-compiler/utils';

import { TMP_SCOPE } from './globals.ts';
import type { HandlerScope } from './scope.ts';
import type { AnyLayer } from '../layer.ts';

export interface Call<T extends (...args: any[]) => any> {
  0: T;
  1: Identifier<any>[];
}

export const buildCall: (
  scope: HandlerScope,
  fn: (...args: any[]) => any,
  args: string,
  argsCount: number,
) => string = isHydrating
  ? (scope, fn, _, argsCount) => {
      injectExternal(fn);
      fn instanceof AsyncFunction && (scope[0] |= 1);
      fn.length > argsCount && (scope[0] |= 2);
      return '';
    }
  : (scope, fn, args, argsCount) => {
      let str = declareLocal(TMP_SCOPE, injectExternal(fn)) + '(' + args;
      if (fn instanceof AsyncFunction) {
        scope[0] |= 1;
        str = 'await ' + str;
      }

      if (fn.length > argsCount) {
        scope[0] |= 2;
        str += ',' + constants.CTX;
      }

      return str + ')';
    };

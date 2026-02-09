import {
  declareLocal,
  injectExternal,
  type Identifier,
} from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';
import { AsyncFunction } from 'runtime-compiler/utils';

import { TMP_SCOPE } from './globals.ts';
import type { HandlerScope } from './scope.ts';
import type { SendLayer } from '../response.ts';

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

export const buildRouteCall: SendLayer<any>[0] = isHydrating
  ? (self, scope, _, paramsCount) =>
      buildCall(scope, self[1], '', self[2].length + paramsCount)
  : (self, scope, params, paramsCount) => {
      const args = self[2];
      return args.length > 0
        ? paramsCount > 0
          ? buildCall(
              scope,
              self[1],
              args.join() + ',' + params,
              args.length + paramsCount,
            )
          : buildCall(scope, self[1], args.join(), args.length)
        : paramsCount > 0
          ? buildCall(scope, self[1], params, paramsCount)
          : buildCall(scope, self[1], '', 0);
    };

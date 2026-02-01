import type { Identifier } from 'runtime-compiler';

import type { ResponseState } from './response.ts';

import type { HandlerScope } from './compilers/scope.ts';
import { buildCall } from './compilers/call.ts';

/**
 * @example
 * f[0](f, scope);
 */
export interface AnyLayer {
  0: (self: any, scope: HandlerScope) => string;
}

/**
 * @example
 * f[0](f, scope);
 */
export interface Layer {
  0: (self: this, scope: HandlerScope) => string;
}

/**
 * @example
 * f[0](f, scope, 'p0,p1,');
 */
export interface AnyRouteLayer<Params extends any[]> {
  0: (
    self: any,
    scope: HandlerScope,
    params: string,
    paramsCount: number,
  ) => string;
  '~'?: Params;
}

/**
 * @example
 * f[0](f, scope, 'p0,p1,');
 */
export interface RouteLayer<Params extends any[]> {
  0: (
    self: this,
    scope: HandlerScope,
    params: string,
    paramsCount: number,
  ) => string;
  '~'?: Params;
}

///
/// Impls
///

interface TapLayer extends Layer {
  1: (...args: any[]) => any;
  2: Identifier<any>[];
}
const loadTap: TapLayer[0] = (self, scope) => {
  const args = self[2];
  return buildCall(scope, self[1], args.join(), args.length) + ';';
};
/**
 * Tap a function to request lifecycle.
 */
export const tap = <Args extends Identifier<any>[]>(
  fn: (
    ...args: [
      ...{
        [K in keyof Args]: Args[K]['~type'];
      },
      res: ResponseState,
    ]
  ) => void | Promise<void>,
  ...args: Args
): TapLayer => [loadTap, fn, args];

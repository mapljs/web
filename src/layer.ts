import { declareLocal, type Identifier } from 'runtime-compiler';

import type { ResponseHeader, ResponseState } from './response.ts';

import type { HandlerScope } from './compilers/scope.ts';
import { buildCall, hydrateCall } from './compilers/call.ts';
import { isHydrating } from 'runtime-compiler/config';
import { TMP_SCOPE } from './compilers/globals.ts';

/**
 * @example
 * f[0](f, scope);
 */
export interface AnyLayer {
  0: (self: any, scope: HandlerScope) => void;
}

/**
 * @example
 * f[0](f, scope);
 */
export interface Layer {
  0: (self: this, scope: HandlerScope) => void;
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
  ) => void;
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
  ) => void;
  '~'?: Params;
}

///
/// Impls
///
export interface TapLayer extends Layer {
  1: (...args: any[]) => any;
  2: Identifier<any>[];
}
const loadTap: TapLayer[0] = isHydrating
  ? (self, scope) => {
      hydrateCall(scope, self[1], self[2].length);
    }
  : (self, scope) => {
      const args = self[2];
      scope[0] += buildCall(scope, self[1], args.join(), args.length) + ';';
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

interface AppendHeadersLayer extends Layer {
  1: ResponseHeader[];
}
const loadAppendHeaders: AppendHeadersLayer[0] = isHydrating
  ? (_, scope) => {
      scope[2] |= 2;
    }
  : (self, scope) => {
      scope[2] |= 2;

      const headers = self[1];
      scope[0] +=
        (headers.length === 1
          ? `${constants.HEADERS}.push(` +
            declareLocal(TMP_SCOPE, JSON.stringify(headers[0]) as any)
          : `${constants.HEADERS}.push(...` +
            declareLocal(TMP_SCOPE, JSON.stringify(headers) as any)) + ');';
    };
/**
 * Append headers on every request.
 */
export const appendHeaders = (
  ...headers: [ResponseHeader, ...ResponseHeader[]]
): AppendHeadersLayer => [loadAppendHeaders, headers];

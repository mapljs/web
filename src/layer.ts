import type { ResponseState } from './send.ts';
import type { Router } from './router.ts';

import type { InferDependencies } from './compiler/utils.ts';

import { declareExternal, type Identifier, declareLocal } from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';

export const _callStatement = (
  router: Router,
  f: (...args: any[]) => any,
  deps: Identifier<any>[],
): string =>
  declareExternal(router, f) +
  (deps.length > 0
    ? f.length > deps.length
      ? `(${deps.join()},${constants.CTX});`
      : `(${deps.join()});`
    : f.length > deps.length
      ? `(${constants.CTX});`
      : `();`);

export const _callAsyncStatement = (
  router: Router,
  f: (...args: any[]) => any,
  deps: Identifier<any>[],
): string => ((router[3] |= 1), _callStatement(router, f, deps));

export const _hydrateCallStatement: (router: Router, f: (...args: any[]) => any) => string =
  declareExternal;

export const _hydrateCallAsyncStatement = (router: Router, f: (...args: any[]) => any): string => (
  (router[3] |= 1), declareExternal(router, f), '' as any
);

/**
 * @example
 * ```ts
 * layer.tap(root, (req) => {
 *   console.log('Request:', req);
 * });
 * ```
 */
export const tap: <const Deps extends Identifier<any>[]>(
  router: Router,
  f: (...args: [...InferDependencies<Deps>, res: ResponseState]) => any,
  ...args: Deps
) => void = isHydrating
  ? (_hydrateCallStatement as any)
  : (router, f, ...args) => {
      router[0] += _callStatement(router, f, args);
    };

/**
 * @example
 * ```ts
 * layer.tap(root, async (req) => {
 *   console.log('Request:', req);
 *   await checkRequest(req);
 * });
 * ```
 */
export const tapAsync: <const Deps extends Identifier<any>[]>(
  router: Router,
  f: (...args: [...InferDependencies<Deps>, res: ResponseState]) => any,
  ...args: Deps
) => void = isHydrating
  ? (_hydrateCallAsyncStatement as any)
  : (router, f, ...args) => {
      router[0] += 'await ' + _callAsyncStatement(router, f, args);
    };

/**
 * @example
 * ```ts
 * layer.defer(root, (req) => {
 *   console.log('End request:', req);
 * });
 * ```
 */
export const defer: <const Deps extends Identifier<any>[]>(
  router: Router,
  f: (...args: [...InferDependencies<Deps>, res: ResponseState]) => any,
  ...args: Deps
) => void = isHydrating
  ? (_hydrateCallStatement as any)
  : (router, f, ...args) => {
      router[2] = _callStatement(router, f, args) + router[2];
    };

/**
 * @example
 * ```ts
 * layer.deferAsync(root, async (req) => {
 *   console.log('End request:', req);
 *   await collectLogs(req);
 * });
 * ```
 */
export const deferAsync: <const Deps extends Identifier<any>[]>(
  router: Router,
  f: (...args: [...InferDependencies<Deps>, res: ResponseState]) => any,
  ...args: Deps
) => void = isHydrating
  ? (_hydrateCallAsyncStatement as any)
  : (router, f, ...args) => {
      router[2] = 'await ' + _callAsyncStatement(router, f, args) + router[2];
    };

/**
 * @example
 * ```ts
 * const token = layer.parse(root, (req) => {
 *   // Parse bearer token or smth...
 *   return tok;
 * }, vars.request);
 *
 * // Just a demo route don't do this :)
 * send.text(
 *   router.get(root, '/token'),
 *   (tok) => tok,
 *   token
 * );
 * ```
 */
export const parse: <const T, const Deps extends Identifier<any>[]>(
  router: Router,
  f: (...args: [...InferDependencies<Deps>, res: ResponseState]) => T,
  ...args: Deps
) => Identifier<T> = isHydrating
  ? (_hydrateCallStatement as any)
  : (router, f, ...args) => declareLocal(router, _callStatement(router, f, args));

/**
 * @example
 * ```ts
 * const token = layer.parseAsync(root, async (req) => {
 *   // Parse bearer token or smth...
 *   return tok;
 * }, vars.request);
 *
 * // Just a demo route don't do this :)
 * send.text(
 *   router.get(root, '/token'),
 *   (tok) => tok,
 *   token
 * );
 * ```
 */
export const parseAsync: <const T, const Deps extends Identifier<any>[]>(
  router: Router,
  f: (...args: [...InferDependencies<Deps>, res: ResponseState]) => T,
  ...args: Deps
) => Identifier<Awaited<T>> = isHydrating
  ? (_hydrateCallAsyncStatement as any)
  : (router, f, ...args) => declareLocal(router, 'await ' + _callStatement(router, f, args));

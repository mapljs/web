import type { ResponseState } from './send.ts';
import type { Router } from './router.ts';

import { injectValue, type InferDependencies } from './compiler/utils.ts';

import { nextId, type Identifier } from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';

export const _call = (
  router: Router,
  f: (...args: any[]) => any,
  deps: Identifier<any>[],
): string =>
  injectValue(f, router) +
  (deps.length > 0
    ? f.length > deps.length
      ? `(${deps.join()},${constants.CTX});`
      : `(${deps.join()});`
    : f.length > deps.length
      ? `(${constants.CTX});`
      : `();`);

export const _callAsync = (
  router: Router,
  f: (...args: any[]) => any,
  deps: Identifier<any>[],
): string => (
  router[3] |= 1,
  _call(router, f, deps)
);

export const _hydrateCall = (router: Router, f: (...args: any[]) => any): string => (
  injectValue(f, router), '' as any
);

export const _hydrateCallAsync = (router: Router, f: (...args: any[]) => any): string => (
  (router[3] |= 1), injectValue(f, router), '' as any
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
  ? (_hydrateCall as any)
  : (router, f, ...args) => {
      router[0] += _call(router, f, args);
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
  ? (_hydrateCallAsync as any)
  : (router, f, ...args) => {
      router[0] += 'await ' + _callAsync(router, f, args);
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
  ? (_hydrateCall as any)
  : (router, f, ...args) => {
      router[2] = _call(router, f, args) + router[2];
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
  ? (_hydrateCallAsync as any)
  : (router, f, ...args) => {
      router[2] = 'await ' + _callAsync(router, f, args) + router[2];
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
  ? (_hydrateCall as any)
  : (router, f, ...args) => {
      const id = nextId(router);
      router[0] += `let ${id}=` + _call(router, f, args);
      return id as any;
    };

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
  ? (_hydrateCallAsync as any)
  : (router, f, ...args) => {
      const id = nextId(router);
      router[0] += `let ${id}=await ` + _callAsync(router, f, args);
      return id as any;
    };

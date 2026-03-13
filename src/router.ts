import { countParams } from '@mapl/router/utils';
import type { Scope } from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';

export interface BaseScope extends Scope {
  /**
   * Scope flags.
   *
   * Bit positions:
   * - `0`: whether scope requires async.
   */
  3: number;

  /**
   * Base path.
   */
  4: string;

  /**
   * Parameter count of the base path.
   */
  5: number;

  /**
   * Parent scope.
   */
  6: Scope;
}

declare const _params: unique symbol;
type _params = typeof _params;

export interface Router<out Params extends any[] = any[]> extends BaseScope {
  [_params]?: Params;

  /**
   * Route list.
   */
  7: Route[];
}

export interface Route<out Params extends any[] = any[]> extends BaseScope {
  [_params]?: Params;

  /**
   * Route method.
   */
  7: string;
}

export type InferParams<
  Path extends string,
  Prev extends any[] = [],
> = Path extends `${string}*${infer Rest}`
  ? Rest extends '*'
    ? [...Prev, string]
    : InferParams<Rest, [...Prev, string]>
  : Prev;

/**
 * Create a root router.
 */
export const init: () => Router<[]> = isHydrating
  ? () => ['', 0, '', 0, '', 0, ['', 0, ''] as any, []] as any
  : () =>
      [constants.CREATE_CTX, 0, '', 0, '', 0, [constants.DECL_GLOBALS, 0, ''] as any, []] as any;

/**
 * Create a subrouter.
 * @param router Parent router
 * @param path Subpath. Must not be `/`.
 */
export const branch = <Params extends any[], Path extends string>(
  router: Router<Params>,
  path: Path,
): Router<InferParams<Path, Params>> => {
  router = router.slice();
  router[4] += path;
  router[5] += countParams(path);
  return router as any;
};

/**
 * Create a new route.
 * @param router
 * @param method
 * @param path
 */
export const route = <Params extends any[], Path extends string>(
  router: Router<Params>,
  method: string,
  path: Path,
): Route<InferParams<Path, Params>> => {
  // @ts-ignore
  const route: Route<InferParams<Path, Params>> = router.slice();
  route[4] = route[4] === '' ? path : path === '/' ? route[4] : route[4] + path;
  route[5] += countParams(path);
  route[7] = method;

  router[7].push(route);

  return route;
};

export type RouteFn = <Params extends any[], Path extends string>(
  router: Router<Params>,
  path: Path,
) => Route<InferParams<Path, Params>>;
export const get: RouteFn = (router, path) => route(router, 'GET', path);
export const head: RouteFn = (router, path) => route(router, 'HEAD', path);
export const post: RouteFn = (router, path) => route(router, 'POST', path);
export const put: RouteFn = (router, path) => route(router, 'PUT', path);
export const del: RouteFn = (router, path) => route(router, 'DELETE', path);
export const patch: RouteFn = (router, path) => route(router, 'PATCH', path);
export const options: RouteFn = (router, path) => route(router, 'OPTIONS', path);
export const any: RouteFn = (router, path) => route(router, '', path);

import { countParams } from '@mapl/router/utils';
import type { State } from './state.ts';

/*
 * From what i've tested closures use 5x more
 * memory than [fn, ...data] and runs slower too
 */

export type Layer<Data extends any[] = any[]> = [
  build: (data: [any, ...Data], state: State) => string,
  ...Data,
];

export type InferPath<Path extends string> =
  Path extends `${string}*${infer Rest}`
    ? Rest extends '*'
      ? [string]
      : [string, ...InferPath<Rest>]
    : [];

export type RouteLayer<Params extends any[] = any[]> = [
  build: (data: any[], state: State, paramCount: Params['length'], paramMap: string[]) => string,
  ...any[],
];

export type Route = [method: string, path: string, ...layers: RouteLayer[]];
export type RouteNoMethod = [path: string, ...layers: RouteLayer[]];

export type RegisterRouteFn = <const Path extends string>(
  path: Path,
  ...layers: RouteLayer<InferPath<Path>>[]
) => Route;
export type RegisterRouteWithMethodFn = <const Path extends string>(
  method: string,
  path: Path,
  ...layers: RouteLayer<InferPath<Path>>[]
) => Route;

export type Router =
  | [layers: Layer[], routes: Route[]]
  | [layers: Layer[], routes: Route[], children: Record<string, Router>];

// Hooks
/**
 * Will be called in `default` and `build` mode.
 */
export let registerRoute: (
  route: Route,
  state: State,
  prefix: string,
  content: string,
) => any;
export const setRegisterRoute = (f: typeof registerRoute): void => {
  registerRoute = f;
};

export const EMPTY_PARAM_MAP: string[] = ['', constants.CTX];

let routeParamMap: string[] = [];
/**
 * Set route param map
 *
 * @example
 * setRouteParamMap([
 *   '', 'c', 'err', 'err,c'
 * ]);
 *
 * routeParamMap[paramCount << 1]; // No context
 * routeParamMap[paramCount << 1 | 1]; // With context
 */
export const setRouteParamMap = (m: string[]): void => {
  routeParamMap = m;
};

// Build implementations
/**
 * Use in `default` and `build` mode.
 *
 * @example
 * build(router, [false, false] as any, '', '');
 */
export const build = (
  router: Router,
  state: State,
  prefix: string,
  content: string,
): void => {
  for (let i = 0, layers = router[0]; i < layers.length; i++) {
    const layer = layers[i];
    content += layer[0](layer, state);
  }

  for (let i = 0, routes = router[1]; i < routes.length; i++) {
    const route = routes[i];

    const routeState = state.slice();
    let routeContent = content;

    for (let j = 2, paramCount = countParams(route[1]); j < route.length; j++) {
      const layer = route[j] as RouteLayer;
      routeContent += layer[0](layer, routeState, paramCount, routeParamMap);
    }

    registerRoute(route, routeState, prefix, routeContent);
  }

  if (router.length > 2) {
    const children = router[2]!;

    for (const key in children)
      build(
        children[key],
        state.slice(),
        key === '/' ? prefix : prefix + key,
        content,
      );
  }
};

/**
 * Use in `hydrate` mode.
 *
 * @example
 * build(router, [false, false] as any);
 */
export const hydrate = (router: Router, state: State): void => {
  for (let i = 0, layers = router[0]; i < layers.length; i++) {
    const layer = layers[i];
    layer[0](layer, state);
  }

  for (let i = 0, routes = router[1]; i < routes.length; i++) {
    const route = routes[i];
    const routeState = state.slice();

    for (let j = 2, paramCount = countParams(route[1]); j < route.length; j++) {
      const layer = route[j] as RouteLayer<string[]>;
      layer[0](layer, routeState, paramCount, routeParamMap);
    }
  }

  if (router.length > 2) {
    const children = router[2]!;
    for (const key in children) hydrate(children[key], state.slice());
  }
};

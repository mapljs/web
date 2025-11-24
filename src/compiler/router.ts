import { countParams } from '@mapl/router/utils';
import type { State } from './state.ts';
import { registerRoute, routeParamMap } from './globals.ts';

/*
 * From what i've tested closures use 5x more
 * memory than [fn, ...data] and runs slower too
 */

export type Layer<Data extends any[] = any[]> = [
  build: (data: any[], state: State) => string,
  ...Data,
];

export type InferPath<Path extends string> =
  Path extends `${string}*${infer Rest}`
    ? Rest extends '*'
      ? [string]
      : [string, ...InferPath<Rest>]
    : [];

export type RouteLayer<Params extends any[]> = [
  build: (
    data: any[],
    state: State,
    paramCount: number,
    paramString: string,
  ) => string,
  ...any[],
] & {
  _?: Params;
};

export type Route = [
  method: string,
  path: string,
  ...layers: RouteLayer<any[]>[],
];

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

/**
 * Run a layer
 */
export const evaluateLayer = (layer: Layer, state: State): string =>
  layer[0](layer, state);

/**
 * Run a route layer
 */
export const evaluateRouteLayer = (
  layer: RouteLayer<any[]>,
  state: State,
  paramCount: number,
  params: string,
): string => layer[0](layer, state, paramCount, params);

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
  for (let i = 0, layers = router[0]; i < layers.length; i++)
    content += evaluateLayer(layers[i], state);

  for (let i = 0, routes = router[1]; i < routes.length; i++) {
    const route = routes[i];

    const routeState = state.slice();
    let routeContent = content;

    for (
      let j = 2,
        paramCount = countParams(route[1]),
        params = routeParamMap[paramCount];
      j < route.length;
      j++
    )
      routeContent += evaluateRouteLayer(
        route[j] as RouteLayer<any[]>,
        routeState,
        paramCount,
        params,
      );

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
  for (let i = 0, layers = router[0]; i < layers.length; i++)
    evaluateLayer(layers[i], state);

  for (let i = 0, routes = router[1]; i < routes.length; i++) {
    const route = routes[i];
    const routeState = state.slice();

    for (let j = 2, paramCount = countParams(route[1]); j < route.length; j++)
      evaluateRouteLayer(
        route[j] as RouteLayer<any[]>,
        routeState,
        paramCount,
        '',
      );
  }

  if (router.length > 2) {
    const children = router[2]!;
    for (const key in children) hydrate(children[key], state.slice());
  }
};

/**
 * @module Global compiler hooks
 *
 * ONLY COMPILER MODULES SHOULD INCLUDE THIS FILE.
 * IF NOT IT BREAKS BUNDLING :(
 */

import type { Route } from './router.ts';
import type { State } from './state.ts';

export let registerRoute: (
  route: Route,
  state: State,
  prefix: string,
  content: string,
) => any;

/**
 * Set a callback that register routes to a router.
 * Use in `default` and `build` mode.
 */
export const setRegisterRoute = (f: typeof registerRoute): void => {
  registerRoute = f;
};

export let routeParamMap: string[] = [];
/**
 * Set route param map.
 * Use in `default` and `build` mode.
 *
 * @example
 * setRouteParamMap([
 *   '', 'err'
 * ]);
 *
 * routeParamMap[paramCount << 1]; // No context
 * routeParamMap[paramCount << 1 | 1]; // With context
 */
export const setRouteParamMap = (m: string[]): void => {
  routeParamMap = m;
};

export let handlerArgs: string;

/**
 * Set request handler args.
 * Use in `default` and `build` mode.
 *
 * @example
 * setHandlerArgs('(req, env, ctx)');
 */
export const setHandlerArgs = (a: string): void => {
  handlerArgs = a;
};

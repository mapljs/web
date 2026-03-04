import {
  createRouter as createMethodRouter,
  insertItem as insertItemToMethodRouter,
  type Router as MethodRouter,
} from '@mapl/router/method';
import compileMethodRouter from '@mapl/router/method/compiler';
import { countParams } from '@mapl/router/utils';

import {
  exportScope,
  markExported,
  type ExportedDependency,
  type Value,
} from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';

import {
  TMP_SCOPE,
  initGlobalScope,
  setHandlerArgs,
} from '../compilers/globals.ts';
import { initScope, wrapScope, type HandlerScope } from '../compilers/scope.ts';

import type { ChildRouter, Router } from '../router.ts';
import type { AnyRouteLayer } from '../layer.ts';

/**
 * Describe compiler compiled result
 */
export type CompiledResult = (req: Request) => Response | Promise<Response>;

let METHOD_ROUTER: MethodRouter<string>;
let PARAM_MAP: string[];

const loadToMethodRouter = (
  router: Router,
  scope: HandlerScope,
  prefix: string,
): void => {
  for (let i = 0, layers = router[0]; i < layers.length; i++) {
    const self = layers[i];
    self[0](self, scope);
  }

  for (let i = 0, routes = router[1]; i < routes.length; i++) {
    const route = routes[i];
    const routeScope = scope.slice();

    for (
      let j = 2,
        paramCount = countParams(route[1]),
        params = PARAM_MAP[paramCount];
      j < route.length;
      j++
    ) {
      const self = route[j] as any as AnyRouteLayer<any[]>;
      self[0](self, routeScope, params, paramCount);
    }

    insertItemToMethodRouter(
      METHOD_ROUTER,
      route[0],
      prefix + route[1],
      wrapScope(routeScope),
    );
  }

  for (let i = 2; i < router.length; i++) {
    const childRouter = router[i] as ChildRouter;

    loadToMethodRouter(
      childRouter[1],
      scope.slice(),
      childRouter[0] === '/' ? prefix : prefix + childRouter[0],
    );
  }
};

/**
 * Load all global state for a router
 *
 * @example
 * setHandlerArgs(constants.GENERIC_ARGS);
 * _load(router);
 */
export const _load = (router: Router): void => {
  initGlobalScope();

  // Initialize globals
  METHOD_ROUTER = createMethodRouter();

  PARAM_MAP = ['', `${constants.PARAMS}0`];
  for (let i = 1; i <= 8; i++)
    PARAM_MAP.push(`${PARAM_MAP[i]},${constants.PARAMS}${i}`);

  // Load router data to method router to build
  loadToMethodRouter(router, ['', 0, 0] as any as HandlerScope, '');
};

export const loadToString = (): Value<CompiledResult> =>
  `(${constants.REQ})=>{${compileMethodRouter(
    METHOD_ROUTER,
    `${constants.REQ}.method`,
    `let ${constants.FULL_URL}=${constants.REQ}.url,${constants.PATH_START}=${constants.FULL_URL}.indexOf('/',10)+1,${constants.PATH_END}=${constants.FULL_URL}.indexOf('?',${constants.PATH_START}),${constants.PATH}=${constants.PATH_END}===-1?${constants.FULL_URL}.slice(${constants.PATH_START}):${constants.FULL_URL}.slice(${constants.PATH_START},${constants.PATH_END});`,
    0,
  )}return ${constants.RES_404}}` as any;

/**
 * Hydrate router data
 */
export const _hydrate = (router: Router, scope: HandlerScope): void => {
  for (let i = 0, layers = router[0]; i < layers.length; i++) {
    const self = layers[i];
    self[0](self, scope);
  }

  for (let i = 0, routes = router[1]; i < routes.length; i++)
    for (
      let j = 2,
        route = routes[i],
        routeScope = scope.slice(),
        paramCount = countParams(route[1]);
      j < route.length;
      j++
    ) {
      const self = route[j] as any as AnyRouteLayer<any[]>;
      self[0](self, routeScope, '', paramCount);
    }

  for (let i = 2; i < router.length; i++)
    _hydrate((router[i] as ChildRouter)[1], scope.slice());
};

/**
 * @example
 * export default {
 *   fetch: getDependency(build(app))
 * };
 */
export const build: (router: Router) => ExportedDependency<CompiledResult> =
  isHydrating
    ? (router) => (_hydrate(router, initScope.slice()), markExported())
    : (router) => (
        setHandlerArgs(constants.GENERIC_ARGS),
        _load(router),
        exportScope(TMP_SCOPE, loadToString())
      );

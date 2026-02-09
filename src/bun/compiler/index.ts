import {
  exportScope,
  markExported,
  type ExportedDependency,
  type Value,
} from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';

import {
  TMP_SCOPE,
  initScope,
  setHandlerArgs,
} from '../../compilers/globals.ts';
import { wrapScope, type HandlerScope } from '../../compilers/scope.ts';

import type { ChildRouter, Router } from '../../router.ts';
import type { AnyRouteLayer } from '../../layer.ts';
import { initRouter, insertItem, toRoutes } from './router.ts';

/**
 * Describe compiler compiled result
 */
export type CompiledResult = Bun.Serve.Routes<any, string>;

let PARAM_MAP: string[];
let WILDCARD_PARAM_MAP: string[];

const loadToMethodRouter = (
  router: Router,
  scope: HandlerScope,
  prefix: string,
  content: string,
): void => {
  for (let i = 0, layers = router[0]; i < layers.length; i++) {
    const self = layers[i];
    content += self[0](self, scope);
  }

  for (let i = 0, routes = router[1]; i < routes.length; i++) {
    const route = routes[i];
    const routeScope = scope.slice();

    let path = route[1];
    let routeContent = content;

    // Preprocess the path
    // '/a/*' -> '/a/:q0'
    // '/**' -> '/*'
    if (path.includes('*')) {
      routeContent = `let ${constants.PARAMS}=${constants.REQ}.params;` + routeContent;
      let paramCount = 1;

      if (path.endsWith('**')) {
        let newPath = '/*',
          endIdx = path.length - 3,
          nextIdx = path.lastIndexOf('*', endIdx);

        while (nextIdx > 1) {
          newPath = ':q' + paramCount++ + path.slice(nextIdx + 1, endIdx) + newPath;

          endIdx = nextIdx;
          nextIdx = path.lastIndexOf('*', nextIdx - 2);
        }

        path = nextIdx > -1
          ? path.slice(0, nextIdx - 1) + ':q' + paramCount++ + path.slice(nextIdx + 1, endIdx) + newPath
          : path.slice(0, endIdx) + newPath;

        for (let j = 2, params = WILDCARD_PARAM_MAP[paramCount]; j < route.length; j++) {
          const self = route[j] as any as AnyRouteLayer<any[]>;
          routeContent += self[0](self, routeScope, params, paramCount);
        }
      } else {
        // Inline first iteration
        let nextIdx = path.lastIndexOf('*'),
          newPath = ':q0' + path.slice(nextIdx + 1),
          endIdx = nextIdx;
        nextIdx = path.lastIndexOf('*', nextIdx - 2);

        while (nextIdx > 1) {
          newPath = ':q' + paramCount++ + path.slice(nextIdx + 1, endIdx) + newPath;

          endIdx = nextIdx;
          nextIdx = path.lastIndexOf('*', nextIdx - 2);
        }

        path = nextIdx > -1
          ? path.slice(0, nextIdx - 1) + ':q' + paramCount++ + path.slice(nextIdx + 1, endIdx) + newPath
          : path.slice(0, endIdx) + newPath;

        for (let j = 2, params = PARAM_MAP[paramCount]; j < route.length; j++) {
          const self = route[j] as any as AnyRouteLayer<any[]>;
          routeContent += self[0](self, routeScope, params, paramCount);
        }
      }
    } else {
      for (let j = 2; j < route.length; j++) {
        const self = route[j] as any as AnyRouteLayer<any[]>;
        routeContent += self[0](self, routeScope, '', 0);
      }
    }

    insertItem(route[0], prefix + path, wrapScope(routeScope, routeContent));
  }

  for (let i = 2; i < router.length; i++) {
    const childRouter = router[i] as ChildRouter;

    loadToMethodRouter(
      childRouter[1],
      scope.slice(),
      childRouter[0] === '/' ? prefix : prefix + childRouter[0],
      content,
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
  initScope();
  initRouter();

  // Params are in reverse order
  PARAM_MAP = ['', `${constants.PARAMS}.q0`];
  WILDCARD_PARAM_MAP = ['', `${constants.PARAMS}['*']`]
  for (let i = 1; i <= 8; i++) {
    const newParam = `${constants.PARAMS}.q` + i + ',';
    PARAM_MAP.push(newParam + PARAM_MAP[i]);
    WILDCARD_PARAM_MAP.push(newParam + WILDCARD_PARAM_MAP[i]);
  }

  // Load router data to method router to build
  loadToMethodRouter(router, [0] as any as HandlerScope, '', '');
};

export const loadToString: () => Value<CompiledResult> = toRoutes as any;

/**
 * Hydrate router data
 */
export const _hydrate = (router: Router, scope: HandlerScope): void => {
  for (let i = 0, layers = router[0]; i < layers.length; i++) {
    const self = layers[i];
    self[0](self, scope);
  }

  for (let i = 0, routes = router[1]; i < routes.length; i++) {
    const route = routes[i];
    const routeScope = scope.slice();

    let path = route[1];
    if (path.includes('*')) {
      let paramCount = 1;

      // Count params
      {
        let i = path.lastIndexOf('*');
        if (i > 1) {
          i = path.lastIndexOf('*', i - 2);
          while (i > 1) {
            paramCount++;
            i = path.lastIndexOf('*', i - 2);
          }
          i > -1 && paramCount++;
        }
      }

      for (let j = 2; j < route.length; j++) {
        const self = route[j] as any as AnyRouteLayer<any[]>;
        self[0](self, routeScope, '', paramCount);
      }
    } else
      for (let j = 2; j < route.length; j++) {
        const self = route[j] as any as AnyRouteLayer<any[]>;
        self[0](self, routeScope, '', 0);
      }
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
    ? (router) => (_hydrate(router, [0] as any as HandlerScope), markExported())
    : (router) => (
        setHandlerArgs(constants.BUN_DENO_ARGS),
        _load(router),
        exportScope(TMP_SCOPE, loadToString())
      );

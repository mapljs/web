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
    let routeContent;

    // Preprocess the path
    // '/a/*' -> '/a/:q0'
    // '/**' -> '/*'
    if (path.includes('*')) {
      let paramCount;

      if (path.endsWith('**')) {
        routeContent = 'let{';
        paramCount = 0;

        let len = path.length - 3,
          newPath = '',
          startIdx = 0;

        for (
          let i = path.indexOf('*');
          i > -1 && i < len;
          i = path.indexOf('*', i + 2)
        ) {
          const id = constants.PARAMS + paramCount++;

          routeContent += id + ',';
          newPath += path.slice(startIdx, i) + ':' + id;

          startIdx = i + 1;
        }

        // Finish the path
        startIdx < len && (newPath += path.slice(startIdx, len));
        path = newPath + '/*';

        // Add wildcard param
        routeContent += '"*":' + constants.PARAMS + paramCount++;
      } else {
        routeContent = 'let{' + constants.PARAMS + '0';
        paramCount = 1;

        // First star always exist
        const firstStar = path.indexOf('*');
        let newPath = path.slice(0, firstStar) + ':' + constants.PARAMS + '0',
          startIdx = firstStar + 1;

        for (
          let i = path.indexOf('*', firstStar + 2);
          i > -1;
          i = path.indexOf('*', i + 2)
        ) {
          const id = constants.PARAMS + paramCount++;

          routeContent += id + ',';
          newPath += path.slice(startIdx, i) + ':' + id;

          startIdx = i + 1;
        }

        // Finish the path
        path =
          startIdx < path.length ? newPath + path.slice(startIdx) : newPath;
      }

      // Finish content
      routeContent += `}=${constants.REQ}.params,${constants.FULL_URL}=${constants.REQ}.url,${constants.PATH_END}=${constants.FULL_URL}.indexOf('?',11);` + content;

      for (let j = 2, params = PARAM_MAP[paramCount]; j < route.length; j++) {
        const self = route[j] as any as AnyRouteLayer<any[]>;
        routeContent += self[0](self, routeScope, params, paramCount);
      }
    } else {
      routeContent = `let ${constants.FULL_URL}=${constants.REQ}.url,${constants.PATH_END}=${constants.FULL_URL}.indexOf('?',11);` + content;

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

  PARAM_MAP = ['', `${constants.PARAMS}0`];
  for (let i = 1; i <= 8; i++)
    PARAM_MAP.push(`${PARAM_MAP[i]},${constants.PARAMS}${i}`);

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

      for (
        let j = 2,
          params = PARAM_MAP[paramCount];
        j < route.length;
        j++
      ) {
        const self = route[j] as any as AnyRouteLayer<any[]>;
        self[0](self, routeScope, params, paramCount);
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

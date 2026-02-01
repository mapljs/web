import {
  evaluate,
  exportExpr,
  markExported,
  type ExportedDependency,
  type Value,
} from 'runtime-compiler';
import { isHydrating, onlyBuild } from 'runtime-compiler/config';

import type { Router } from '../router.ts';

import {
  _hydrate,
  _load,
  loadToString as genericLoadToString,
} from '../generic/compiler.ts';

import type { HandlerScope } from '../compilers/scope';
import { SCOPE, setHandlerArgs } from '../compilers/globals.ts';

/**
 * Describe compiler compiled result
 */
export type CompiledResult = () => ExportedHandlerFetchHandler<Cloudflare.Env, unknown>;

export const loadToString = (): Value<CompiledResult> =>
  ('()=>{' +
    SCOPE[0] +
    'return ' +
    genericLoadToString() +
    '}') as any;

/**
 * @example
 * const createFetch = getDependency(build(app));
 *
 * export default {
 *   // Must be set as 'fetch' property of an object
 *   fetch(...args) {
 *     // Set up stuff...
 *     return (this.fetch = createFetch())(...args);
 *   }
 * } satisfies ExportedHandler<Env>;
 */
export const build: (router: Router) => ExportedDependency<CompiledResult> =
  isHydrating
    ? (router) => (_hydrate(router, [0] as any as HandlerScope), markExported())
    : onlyBuild
      ? (router) => (
          setHandlerArgs(constants.CLOUDFLARE_ARGS),
          _load(router),
          exportExpr(loadToString())
        )
      : (router) => {
          setHandlerArgs(constants.CLOUDFLARE_ARGS);
          _load(router);

          const id = exportExpr(loadToString());
          evaluate();
          return id as any;
        };

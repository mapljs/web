import {
  exportExpr,
  markExported,
  type ExportedDependency,
  type Value,
} from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';

import type {
  ExportedHandlerFetchHandler,
  Cloudflare,
} from '@cloudflare/workers-types';

import type { Router } from '../router.ts';

import {
  _hydrate,
  _load,
  loadToString as genericLoadToString,
} from '../generic/compiler.ts';

import { initScope } from '../compilers/scope';
import { TMP_SCOPE, setHandlerArgs } from '../compilers/globals.ts';

/**
 * Describe compiler compiled result
 */
export type CompiledResult = () => ExportedHandlerFetchHandler<
  Cloudflare.Env,
  unknown
>;

export const loadToString = (): Value<CompiledResult> =>
  ('()=>{' + TMP_SCOPE[0] + 'return ' + genericLoadToString() + '}') as any;

/**
 * @example
 * const createFetch = getDependency(build(app));
 *
 * export default {
 *   fetch(...args) {
 *     // Set up stuff...
 *     return (this.fetch = createFetch())(...args);
 *   }
 * } satisfies ExportedHandler<Env>;
 */
export const build: (router: Router) => ExportedDependency<CompiledResult> =
  isHydrating
    ? (router) => (_hydrate(router, initScope.slice()), markExported())
    : (router) => (
        setHandlerArgs(constants.CLOUDFLARE_ARGS),
        _load(router),
        exportExpr(loadToString())
      );

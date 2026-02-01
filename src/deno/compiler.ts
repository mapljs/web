import {
  evaluate,
  exportExpr,
  markExported,
  type ExportedDependency,
} from 'runtime-compiler';
import { isHydrating, onlyBuild } from 'runtime-compiler/config';

import type { Router } from '../router.ts';

import {
  _hydrate,
  _load,
  loadToString,
} from '../generic/compiler.ts';
import type { HandlerScope } from '../compilers/scope';
import { SCOPE, setHandlerArgs } from '../compilers/globals.ts';

/**
 * Describe compiler compiled result
 */
export type CompiledResult = (
  req: Request,
) => Response | Promise<Response>;

/**
 * @example
 * Deno.serve(getDependency(build(app)));
 */
export const build: (router: Router) => ExportedDependency<CompiledResult> =
  isHydrating
    ? (router) => (_hydrate(router, [0] as any as HandlerScope), markExported())
    : onlyBuild
      ? (router) => (
          setHandlerArgs(constants.BUN_DENO_ARGS),
          _load(router),
          exportExpr(loadToString())
        )
      : (router) => {
          setHandlerArgs(constants.BUN_DENO_ARGS);
          _load(router);

          const id = exportExpr(loadToString());
          evaluate();
          return id as any;
        };

import {
  exportExpr,
  markExported,
  type ExportedDependency,
} from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';

import type { Router } from '../router.ts';

import { _hydrate, _load, loadToString } from '../generic/compiler.ts';
import { initScope } from '../compilers/scope.ts';
import { setHandlerArgs } from '../compilers/globals.ts';

/**
 * Describe compiler compiled result
 */
export type CompiledResult = (req: Request) => Response | Promise<Response>;

/**
 * @example
 * Deno.serve(getDependency(build(app)));
 */
export const build: (router: Router) => ExportedDependency<CompiledResult> =
  isHydrating
    ? (router) => (_hydrate(router, initScope.slice()), markExported())
    : (router) => (
        setHandlerArgs(constants.BUN_DENO_ARGS),
        _load(router),
        exportExpr(loadToString())
      );

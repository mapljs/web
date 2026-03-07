import { declareLocal, exportScope, markExported, type ExportedDependency } from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';

import type { Router } from '../generic/router.ts';

import { createRouter, insertItem } from '@mapl/router/method';
import compileRouter from '@mapl/router/method/compiler';

export default (isHydrating
  ? markExported
  : (router) => {
      const urlRouter = createRouter<string>();

      for (let i = 0, routes = router[7]; i < routes.length; i++) {
        const route = routes[i];

        const content = route[0] + route[2];
        const flags = route[3];

        insertItem(
          urlRouter,
          route[7],
          route[4],
          (flags & 1) === 1
            ? 'return ' +
                declareLocal(route[6], `async${constants.BUN_DENO_ARGS}=>{${content}}`) +
                constants.BUN_DENO_ARGS
            : content,
        );
      }

      return exportScope(
        router[6],
        `${constants.BUN_DENO_ARGS}=>{let ${constants.FULL_URL}=${constants.REQ}.url,${constants.PATH_START}=${constants.FULL_URL}.indexOf('/',10)+1,${constants.PATH_END}=${constants.FULL_URL}.indexOf('?',${constants.PATH_START}),${constants.PATH}=${constants.PATH_END}===-1?${constants.FULL_URL}.slice(${constants.PATH_START}):${constants.FULL_URL}.slice(${constants.PATH_START},${constants.PATH_END});${compileRouter(
          urlRouter,
          `${constants.REQ}.method`,
          0,
        )}return ${constants.RES_404}}` as any,
      );
    }) as <Addr extends Deno.Addr = Deno.Addr>(
  router: Router<[]>,
) => ExportedDependency<Deno.ServeHandlerInfo<Addr>>;

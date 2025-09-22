import {
  hydrateDependency,
  setCompileErrorHandlerHook,
  setCompileHandlerHook,
} from '@mapl/framework';
import { injectExternalDependency, markExported } from 'runtime-compiler';

import type { RouterTag } from '../core/index.js';
import '../core/context.js';
import type { HandlerData } from '../core/handler.js';
import { countParams } from '@mapl/router/path';

export const hydrateRouter = (router: RouterTag): void => {
  setCompileHandlerHook((handler, _, _1, scope) => {
    const fn = handler[2];
    injectExternalDependency(fn);
    (handler[3] as HandlerData)?.type?.(
      '',
      scope[1] || fn.length > countParams(handler[1]),
    );
  });
  setCompileErrorHandlerHook((_, fn, dat, scope) => {
    injectExternalDependency(fn);
    (dat as HandlerData)?.type?.('', scope[1] || fn.length > 1);
    return '';
  });
  hydrateDependency(router as any, [false, false, , '', false], '');
};

export default (router: RouterTag): void => {
  hydrateRouter(router);
  // Mark the export slot for the final handler
  markExported();
};

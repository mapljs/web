import { hydrateDependency, hooks } from '@mapl/framework';
import { countParams } from '@mapl/router/path';
import { injectExternalDependency, markExported } from 'runtime-compiler';

import type { RouterTag } from '../core/index.js';
import '../core/context.js';
import type { HandlerData } from '../core/handler.js';
import type { GenericContext } from '../index.js';

export const hydrateRouter = (
  router: RouterTag<GenericContext>,
): void => {
  hooks.compileHandler = (handler, _, _1, scope) => {
    const fn = handler[2];
    injectExternalDependency(fn);
    (handler[3] as HandlerData)?.type?.(
      '',
      scope[1] || fn.length > countParams(handler[1]),
    );
  };
  hooks.compileErrorHandler = (_, fn, dat, scope) => {
    injectExternalDependency(fn);
    (dat as HandlerData)?.type?.('', scope[1] || fn.length > 1);
    return '';
  };
  hydrateDependency(router as any, [false, false, , '', false], '');
};

export default (
  router: RouterTag<GenericContext>,
): void => {
  hydrateRouter(router);
  // Mark the export slot for the final handler
  markExported();
};

import { hydrateDependency, setHooks } from '@mapl/framework';
import { injectExternalDependency, markExported } from 'runtime-compiler';

import type { RouterTag } from '../core/index.js';
import '../core/context.js';

export default (router: RouterTag): void => {
  const hook = (fn: any) => {
    injectExternalDependency(fn);
    return '';
  };
  setHooks({
    compileHandler: hook,
    compileErrorHandler: hook,
  });
  hydrateDependency(router as any, [false, false, , '', false], '');

  // Mark the export slot for the final handler
  markExported();
};

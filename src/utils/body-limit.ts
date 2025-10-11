import { macro, type MiddlewareTypes } from '../core/middleware.js';

import { injectDependency, lazyDependency, noOp } from 'runtime-compiler';
import { isHydrating } from 'runtime-compiler/config';

import { createAsyncScope } from '@mapl/framework';

export const RES413: () => string = isHydrating
  ? noOp
  : lazyDependency(injectDependency, 'new Response(null,{status:413})');

/**
 * Set size limit for body.
 * If you use Bun, use their `maxRequestBodySize` option instead.
 */
export const size: (bytes: number) => MiddlewareTypes<any, never, {}> =
  isHydrating
    ? () => macro(createAsyncScope)
    : (bytes) =>
        macro(
          (scope) =>
            createAsyncScope(scope) +
            'if(' +
            constants.REQ +
            '.body!==null){let l=' +
            constants.REQ +
            '.headers.get("content-length");if(l===null||' +
            constants.REQ +
            '.headers.has("transfer-encoding")){let g=' +
            constants.REQ +
            '.clone().body.getReader(),i=await g.read(),s=0;while(!i.done){s+=i.value.byteLength;if(s>' +
            bytes +
            ')return ' +
            RES413() +
            ';i=await g.read()}}else if(l>' +
            bytes +
            ')return ' +
            RES413() +
            '}',
        );

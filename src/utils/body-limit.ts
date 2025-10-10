import { err as createErr, type Err } from '@safe-std/error';
import { macro, type MiddlewareTypes } from '../core/middleware.js';
import { isHydrating } from 'runtime-compiler/config';
import { compileErrorHandler, createAsyncScope } from '@mapl/framework';
import { injectExternalDependency, lazyDependency } from 'runtime-compiler';

const errSymbol: unique symbol = Symbol();
export const err: Err<typeof errSymbol> = createErr(errSymbol);
export const ERR_DEP: () => string = lazyDependency(
  injectExternalDependency,
  err,
);

/**
 * Set size limit for body.
 * If you use Bun, use their maxRequestBodySize option instead.
 */
export const size: (bytes: number) => MiddlewareTypes<any, typeof err, {}> =
  isHydrating
    ? () =>
        macro((scope) => {
          createAsyncScope(scope);
          compileErrorHandler(ERR_DEP(), scope);
          return '';
        })
    : (bytes) =>
        macro(
          (scope) =>
            createAsyncScope(scope) +
            'if(' +
            constants.REQ +
            '.body!==null){let r=' +
            constants.REQ +
            '.clone().body.getReader(),i=await r.read(),s=0;while(!i.done){s+=i.value.byteLength;if(s>' +
            bytes +
            '){' +
            compileErrorHandler(ERR_DEP(), scope) +
            '}i=await r.read()}}',
        );

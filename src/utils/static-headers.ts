import { isHydrating } from 'runtime-compiler/config';
import type { Header } from '../core/context.js';
import { macro, noOpMacro, type MiddlewareTypes } from '../core/middleware.js';
import { injectDependency } from 'runtime-compiler';

export const injectList = (list: any[]): string =>
  list.length !== 1
    ? '...' + injectDependency(JSON.stringify(list))
    : injectDependency(JSON.stringify(list[0]));

export default (isHydrating
  ? () => noOpMacro
  : (headers) =>
      macro(
        () =>
          constants.HEADERS +
          '.push(' +
          injectList(
            Array.isArray(headers)
              ? headers
              : headers instanceof Headers
                ? headers.entries().toArray()
                : Object.entries(headers),
          ) +
          ');',
      )) as (
  headers: Headers | Header[] | Record<string, any>,
) => MiddlewareTypes<any, never, {}>;

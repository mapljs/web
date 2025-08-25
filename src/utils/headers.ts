import type { Header } from '../core/context.js';
import { tap, type MiddlewareTypes } from '../core/middleware.js';

export default (
  headers: Headers | Header[] | Record<string, any>,
): MiddlewareTypes<never, {}> => (
  (headers = Array.isArray(headers)
    ? headers
    : headers instanceof Headers
      ? headers.entries().toArray()
      : Object.entries(headers)),
  tap((c) => {
    c.headers.push(...(headers as any[]));
  })
);

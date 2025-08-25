import secureHeaders, { type Options } from 'secure-headers';
import { tap, type MiddlewareTypes } from '../core/middleware.js';

export default (headers: Options): MiddlewareTypes<never, {}> => (
  (headers = Object.entries(secureHeaders(headers)) as any),
  tap((c) => {
    c.headers.push(...(headers as any[]));
  })
);

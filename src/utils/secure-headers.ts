import secureHeaders, { type Options } from 'secure-headers';
import type { MiddlewareTypes } from '../core/middleware.js';
import staticHeaders from './static-headers.js';

export default (headers: Options): MiddlewareTypes<never, {}> =>
  staticHeaders(secureHeaders(headers));

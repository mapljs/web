import type { Context } from '../core/context.js';

export default (
  c: Context,
  location: string,
  status: 301 | 302 | 307 | 308,
): void => {
  c.status = status;
  c.headers.push(['location', location]);
};

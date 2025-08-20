import { tap, type MiddlewareTypes } from '../core/middleware.js';
import type { RequestMethod } from '../core/utils.js';

export type HeaderValue = '*' | (string & {}) | [string, string, ...string[]];

// Ensure people don't make mistake categorizing headers
declare const _: unique symbol;
export type Header = [string, string] & {
  [_]: 0;
}
export type PreflightHeader = Header & {
  [_]: 1;
}

export const allowMethods = (v: RequestMethod[] | RequestMethod): PreflightHeader =>
  ['Access-Control-Allow-Methods', v] as any;
export const allowHeaders = (v: string[] | string): PreflightHeader =>
  ['Access-Control-Allow-Headers', '' + v] as any;
export const maxAge = (v: number): PreflightHeader =>
  ['Access-Control-Max-Age', '' + v] as any;

export const allowCredentials: Header = [
  'Access-Control-Allow-Credentials',
  'true',
] as any;
export const exposeHeaders = (v: string[] | string): Header =>
  ['Access-Control-Expose-Headers', '' + v] as any;

export const init = (
  origins: HeaderValue,
  preflightHeaders: PreflightHeader[] = [],
  headers: Header[] = [],
): MiddlewareTypes<never, {}> => {
  if (origins !== '*') {
    headers.push(['Vary', 'Origin'] as any);

    if (Array.isArray(origins))
      return tap((c) => {
        const origin = c.req.headers.get('Origin');

        c.headers.push([
          'Access-Control-Allow-Origin',
          typeof origin === 'string' && origins.includes(origin)
            ? origin
            : origins[0],
        ], ...headers);

        c.req.method === 'OPTIONS' && c.headers.push(...preflightHeaders);
      });
  }

  headers.push(['Access-Control-Allow-Origin', origins] as Header);
  return tap((c) => {
    c.headers.push(...headers);
    c.req.method === 'OPTIONS' && c.headers.push(...preflightHeaders);
  });
};

import { tap, type MiddlewareTypes } from '../core/middleware.js';
import type { Tag } from '../core/utils.js';

type HeaderValue = '*' | (string & {}) | [string, string, ...string[]];

declare const header: unique symbol;
type Header = Tag<{}, typeof header>;

declare const preflight: unique symbol;
type PreflightHeader = Tag<{}, typeof preflight>;

export const allowMethods = (v: HeaderValue): PreflightHeader =>
  ['Access-Control-Allow-Methods', '' + v] as any;
export const allowHeaders = (v: HeaderValue): PreflightHeader =>
  ['Access-Control-Allow-Headers', '' + v] as any;
export const maxAge = (v: number): PreflightHeader =>
  ['Access-Control-Max-Age', '' + v] as any;

export const allowCredentials: Header = [
  'Access-Control-Allow-Credentials',
  'true',
] as any;
export const exposeHeaders = (v: HeaderValue): Header =>
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
        ]);

        c.headers.push(...(headers as any[]));
        if (c.req.method === 'OPTIONS')
          c.headers.push(...(preflightHeaders as any[]));
      });
  }

  headers.push(['Access-Control-Allow-Origin', origins] as any);
  return tap((c) => {
    c.headers.push(...(headers as any[]));
    if (c.req.method === 'OPTIONS')
      c.headers.push(...(preflightHeaders as any[]));
  });
};

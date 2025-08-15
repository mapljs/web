import { tap, type MiddlewareTypes } from '../core/middleware.js';

type HeaderValue = '*' | (string & {}) | [string, string, ...string[]];

declare const header: unique symbol;
interface Header {
  [header]: 0;
}

declare const preflight: unique symbol;
interface PreflightHeader {
  [preflight]: 0;
}

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

        const headers = c.headers;
        headers.push([
          'Access-Control-Allow-Origin',
          typeof origin === 'string' && origins.includes(origin)
            ? origin
            : origins[0],
        ]);

        headers.push(...(headers as any[]));
        c.req.method === 'OPTIONS' && headers.push(...(preflightHeaders as any[]));
      });
  }

  headers.push(['Access-Control-Allow-Origin', origins] as any);
  return tap((c) => {
    c.headers.push(...(headers as any[]));
    c.req.method === 'OPTIONS' && c.headers.push(...(preflightHeaders as any[]));
  });
};

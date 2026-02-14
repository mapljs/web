import { isHydrating } from 'runtime-compiler/config';
import type { Layer } from './layer.ts';
import type { ResponseHeader } from './response.ts';
import { buildData, createBuildSlot, declareLocal } from 'runtime-compiler';
import { TMP_SCOPE } from './compilers/globals.ts';

export const allowCredentials: ResponseHeader = [
  'Access-Control-Allow-Credentials',
  'true',
];

/**
 * Allow all origins to access the resource **without credentials**.
 */
export const allowAllOrigins: ResponseHeader = [
  'Access-Control-Allow-Origin',
  '*',
];

/**
 * Allow only 1 origin to access the resource.
 */
export const allowOrigin = (origin: string): ResponseHeader => [
  'Access-Control-Allow-Origin',
  origin,
];

/**
 * Use in response to a **preflight** request to indicate which HTTP
 * headers can be used when making the actual request.
 */
export const allowHeaders = (...headers: string[]): ResponseHeader => [
  'Access-Control-Allow-Headers',
  headers.join(', '),
];

/**
 * Specifies the method or methods allowed when accessing the resource.
 * This is used in response to a **preflight** request.
 */
export const allowMethods = (...headers: string[]): ResponseHeader => [
  'Access-Control-Allow-Methods',
  headers.join(', '),
];

/**
 * Indicates how long the results of a **preflight** request can be cached.
 */
export const maxAge = (seconds: number): ResponseHeader => [
  'Access-Control-Max-Age',
  '' + seconds,
];

/**
 * Adds the specified headers to the allowlist that JavaScript
 * (such as Response.headers) in browsers is allowed to access.
 */
export const exposeHeaders = (...headers: string[]): ResponseHeader => [
  'Access-Control-Expose-Headers',
  headers.join(', '),
];

export interface AllowOriginsLayer extends Layer {
  1: string[];
}

const VARY_ORIGIN_STORE = createBuildSlot();
const loadAllowOrigins: AllowOriginsLayer[0] = isHydrating
  ? (_, scope) => {
      scope[2] |= 2;
    }
  : (self, scope) => {
      scope[2] |= 2;

      const origins = self[1];
      const firstOrigin = JSON.stringify(origins[0]);

      let str =
        `{let o=${constants.REQ}.headers.get('Origin');${constants.HEADERS}.push(` +
        (buildData[VARY_ORIGIN_STORE] ??= declareLocal(
          TMP_SCOPE,
          '["Vary","Origin"]' as any,
        )) +
        ',["Access-Control-Allow-Origin",o===' +
        firstOrigin;
      for (let i = 1; i < origins.length; i++)
        str += `||o===` + JSON.stringify(origins[i]);

      scope[0] += str + '?o:' + firstOrigin + '])}';
    };
/**
 * Create a layer that decides what origins can access the resource.
 */
export const allowOrigins = (
  ...origins: [string, string, ...string[]]
): AllowOriginsLayer => [loadAllowOrigins, origins];

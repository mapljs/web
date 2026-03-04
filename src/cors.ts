import type { ResponseHeader } from './response.ts';

/**
 * describes that the request origin can influence the content of the response.
 */
export const varyOrigin: ResponseHeader = ['Vary', 'Origin'];

/**
 * Whether the server allows credentials to be included in cross-origin HTTP requests.
 */
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

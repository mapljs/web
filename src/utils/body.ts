import { attach, type MiddlewareTypes } from '../core/middleware.js';

interface TBody<T> {
  body: T;
}

/**
 * Parse body to text
 */
export const text: MiddlewareTypes<never, TBody<string>> = attach(
  'body',
  async (c) => c.req.text(),
);

/**
 * Parse body to a blob
 */
export const blob: MiddlewareTypes<never, TBody<Blob>> = attach(
  'body',
  async (c) => c.req.blob(),
);

/**
 * Parse body to a byte array
 */
export const bytes: MiddlewareTypes<never, TBody<Uint8Array>> = attach(
  'body',
  async (c) => c.req.bytes(),
);

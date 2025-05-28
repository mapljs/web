import { attach, type MiddlewareTypes } from '../core/middleware.js';

/**
 * Parse body to text
 */
export const text: MiddlewareTypes<never, Record<'body', string>> = attach(
  'body',
  async (c) => c.req.text(),
);

/**
 * Parse body to a blob
 */
export const blob: MiddlewareTypes<never, Record<'body', Blob>> = attach(
  'body',
  async (c) => c.req.blob(),
);

/**
 * Parse body to a byte array
 */
export const bytes: MiddlewareTypes<never, Record<'body', Uint8Array>> = attach(
  'body',
  async (c) => c.req.bytes(),
);

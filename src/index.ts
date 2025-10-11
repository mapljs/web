import {
  routerImpl,
  type ChildRouters,
  type InferHandlers,
  type InferRouter,
} from './core/index.js';
import type { MiddlewareTypes } from './core/middleware.js';

/**
 * Generic context
 */
export interface GenericContext {
  readonly req: Request;
}

/**
 * Generic router
 */
export const router: <
  // TODO: Type middleware as well
  const T extends MiddlewareTypes<GenericContext, any, any>[],
  const S extends ChildRouters<GenericContext> = {},
>(
  middlewares: T,
  handlers: InferHandlers<GenericContext, T>,
  children?: S,
) => InferRouter<GenericContext, T, S> = routerImpl;

export * as layer from './core/middleware.js';
export * as handle from './core/handler.js';

export * as cors from './utils/cors.js';
export * as bearerAuth from './utils/bearer-auth.js';
export * as basicAuth from './utils/basic-auth.js';
export * as bodyLimit from './utils/body-limit.js';

export { default as redirect } from './utils/redirect.js';
export { default as staticHeaders } from './utils/static-headers.js';

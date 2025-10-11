import type { BunRequest, Server } from 'bun';
import {
  type ChildRouters,
  type InferHandlers,
  type InferRouter,
  routerImpl,
} from '../core/index.js';
import type { MiddlewareTypes } from '../core/middleware.js';

export interface BunContext {
  readonly req: BunRequest;
  readonly server: Server<any>;
}

export const router: <
  // TODO: Type middleware as well
  const T extends MiddlewareTypes<BunContext, any, any>[],
  const S extends ChildRouters<BunContext> = {},
>(
  middlewares: T,
  handlers: InferHandlers<BunContext, T>,
  children?: S,
) => InferRouter<BunContext, T, S> = routerImpl;

import type { BunRequest, Server } from "bun";
import { type ChildRouters, type InferHandlers, type InferRouter, routerImpl } from "../core/index.js";
import type { AnyMiddlewareTypes } from "../core/middleware.js";

export default routerImpl as <
  const T extends AnyMiddlewareTypes[],
  const S extends ChildRouters = {},
>(
  middlewares: T,
  handlers: InferHandlers<{
    req: BunRequest,
    server: Server
  }, T>,
  children?: S,
) => InferRouter<T, S>;

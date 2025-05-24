import type { HandlerTag } from "./handler.js";
import type { AnyMiddlewareTypes } from "./middleware.js";
import type { Tag, ToNever, UnionToIntersection } from "./utils.js";

declare const routerTag: unique symbol;
// Store error
export type RouterTag<E = any> = Tag<E, typeof routerTag>;

export type InferError<
  T extends AnyMiddlewareTypes[],
  S extends Record<string, RouterTag>,
> = ToNever<T[number][0] | S[string][typeof routerTag]>;

export type InferHandler<T extends AnyMiddlewareTypes[]> = HandlerTag<
  T extends [] ? {} : UnionToIntersection<T[number][1]>
>;

/**
 * Create a router
 */
export default ((...args: any[]): any => {
  switch (args.length) {
    case 2:
      return [args[0], args[1], null, []];
    case 3:
      return Array.isArray(args[2])
        ? [args[0], args[1], args[2], []]
        : [args[0], args[1], null, Object.entries(args[2])];
    case 4:
      args[3] = Object.entries(args[3]);
      return args;
  }
}) as (<
  const T extends AnyMiddlewareTypes[],
  const S extends Record<string, RouterTag> = {},
>(
  middlewares: T,
  handlers: InferHandler<T>[],
  children?: S,
) => RouterTag<InferError<T, S>>) &
  // Both children and error handler provided
  (<
    const T extends AnyMiddlewareTypes[],
    const S extends Record<string, RouterTag>,
  >(
    middlewares: T,
    handlers: InferHandler<T>[],
    children: S,
    err: HandlerTag<InferError<T, S>>,
  ) => RouterTag<never>) &
  // No children provided but error handler is provided
  (<const T extends AnyMiddlewareTypes[]>(
    middlewares: T,
    handlers: InferHandler<T>[],
    err: HandlerTag<InferError<T, {}>>,
  ) => RouterTag<never>);

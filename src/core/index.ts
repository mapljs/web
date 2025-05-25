import type { HandlerTag } from "./handler.js";
import type { AnyMiddlewareTypes } from "./middleware.js";
import type { Tag, ToNever, UnionToIntersection } from "./utils.js";

declare const routerTag: unique symbol;
export type RouterTag<E = any> = Tag<E, typeof routerTag>;

export type InferError<
  T extends AnyMiddlewareTypes[],
  S extends Record<string, RouterTag>,
> = ToNever<S[keyof S][typeof routerTag] | T[number][0]>;

export type InferHandler<T extends AnyMiddlewareTypes[]> = HandlerTag<
  T extends [] ? {} : UnionToIntersection<T[number][1]>
>;

export default <
  const T extends AnyMiddlewareTypes[],
  const S extends Record<string, RouterTag> = {},
>(
  middlewares: T,
  handlers: InferHandler<T>[],
  children?: S,
): RouterTag<InferError<T, S>> =>
  [
    middlewares,
    handlers,
    null,
    children == null ? [] : Object.entries(children),
  ] as any;

import type { HandlerTag } from './handler.js';
import type { AnyMiddlewareTypes } from './middleware.js';
import type { UnionToIntersection } from './utils.js';

declare const routerTag: unique symbol;
export interface RouterTag<out E = any> {
  [routerTag]: E;
}

export type InferError<
  T extends AnyMiddlewareTypes[],
  S extends Record<string, RouterTag>,
> = S[keyof S][typeof routerTag] | T[number][0];

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
): RouterTag<InferError<T, S>> => [middlewares, handlers, , children] as any;

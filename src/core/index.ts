import type { HandlerTag } from './handler.js';
import type { AnyMiddlewareTypes } from './middleware.js';
import type { UnionToIntersection } from './utils.js';

declare const _: unique symbol;
export interface RouterTag<out E = any> {
  [_]: E;
}

export default <
  const T extends AnyMiddlewareTypes[],
  const S extends Record<string, RouterTag> = {},
>(
  middlewares: T,
  handlers: HandlerTag<
    T extends [] ? {} : UnionToIntersection<T[number][1]>
  >[],
  children?: S,
): RouterTag<S[keyof S][typeof _] | T[number][0]> => [middlewares, handlers, , children] as any;

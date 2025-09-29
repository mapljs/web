import type { HandlerTag } from './handler.js';
import type { AnyMiddlewareTypes } from './middleware.js';
import type { UnionToIntersection } from './utils.js';

declare const _: unique symbol;
export interface RouterTag<out E = any> {
  [_]: E;
}
export type ChildRouters = Record<string, RouterTag>;

export type InferHandlers<C, T extends AnyMiddlewareTypes[]> = HandlerTag<T extends [] ? C : C & UnionToIntersection<T[number][1]>>[];
export type InferRouter<T extends AnyMiddlewareTypes[], S extends ChildRouters> = RouterTag<S[keyof S][typeof _] | T[number][0]>;

// Untyped router
/**
 * @internal
 */
export const routerImpl = (middlewares: any[], handlers: any[], children: Record<string, any>): any => [
  middlewares, handlers,, children
]

export default routerImpl as <
  const T extends AnyMiddlewareTypes[],
  const S extends ChildRouters = {},
>(
  middlewares: T,
  handlers: InferHandlers<{
    req: Request
  }, T>,
  children?: S,
) => InferRouter<T, S>;

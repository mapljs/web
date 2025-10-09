import type { HandlerTag } from './handler.js';
import type {
  AnyMiddlewareTypes,
  InferMiddlewareState,
  InferMiddlewareErr,
} from './middleware.js';
import type { UnionToIntersection } from './utils.js';

declare const _: unique symbol;
export interface RouterTag<in out C, out E = any> {
  [_]: [E, C];
}
export type ChildRouters<C> = Record<string, RouterTag<C, any>>;

export type InferHandlers<C, T extends AnyMiddlewareTypes[]> = HandlerTag<
  T extends [] ? C : C & UnionToIntersection<InferMiddlewareState<T[number]>>
>[];
export type InferRouterErr<T extends RouterTag<any>> = T[typeof _][0];
export type InferRouter<
  C,
  T extends AnyMiddlewareTypes[],
  S extends ChildRouters<C>,
> = RouterTag<C, InferRouterErr<S[keyof S]> | InferMiddlewareErr<T[number]>>;

// Untyped router
/**
 * @internal
 */
export const routerImpl = (
  middlewares: any[],
  handlers: any[],
  children: any,
): any => [middlewares, handlers, , children];

import type { Err } from 'safe-throw';
import type {
  MiddlewareTypes,
  AnyMiddlewareTypes,
  MergeMiddlewareTypes,
  ErrorHandler,
  Handler,
  HandlerData,
  InferPath,
  RequestMethod
} from './handler.js';
import { proto } from './utils.js';
import { ALL } from '@mapl/router/method/index.js';

declare const tag: unique symbol;
export interface RouteHandler<in out S> {
  readonly [tag]: S;
}

export type RouterTag = RouteHandler<typeof tag>;
export type AnyRouter = AnyMiddlewareTypes & RouterTag;

/**
 * Create a router
 * @param middlewares
 * @param handlers
 * @param children
 */
export const init = <const T extends AnyMiddlewareTypes[]>(
  middlewares: T,
  handlers: RouteHandler<MergeMiddlewareTypes<T>[1]>[],
  children: Record<string, AnyRouter> = {}
): MergeMiddlewareTypes<T> & RouterTag => [middlewares, handlers, null, Object.entries(children)] as any;

/**
 * Handle requests to a path with a specific method
 * @param method
 * @param path
 * @param handler
 * @param dat
 */
export const on = <S, P extends string>(
  method: RequestMethod | (string & {}),
  path: P,
  handler: Handler<InferPath<P>, S & {}>,
  ...dat: HandlerData[]
): RouteHandler<S> => [method, path, handler, proto(...dat)] as any;

/**
 * Handle any request method
 * @param path
 * @param handler
 * @param dat
 */
export const any = <S, P extends string>(
  path: P,
  handler: Handler<InferPath<P>, S & {}>,
  ...dat: HandlerData[]
): RouteHandler<S> => [ALL, path, handler, proto(...dat)] as any;

/**
 * Handle router error
 * @param router
 * @param f
 */
export const onErr = <E extends Err, S extends {}>(
  router: MiddlewareTypes<E, S> & RouterTag,
  f: ErrorHandler<E, S>,
): void => {
  // @ts-ignore
  router[2] = f;
};

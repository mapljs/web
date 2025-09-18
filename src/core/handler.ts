import type { Err } from '@safe-std/error';
import type { Context } from './context.js';
import type { RouterTag } from './index.js';
import type { RequestMethod } from './utils.js';

export interface HandlerData extends Record<symbol, any> {
  type?: 'json' | 'html' | 'raw' | null;
}

export type Handler<
  Params extends string[] = string[],
  T extends {} = Record<string, any>,
  R = any,
> = (...args: [...params: Params, c: Context & T]) => R;

export type InferPath<T extends string> = T extends `${string}*${infer Next}`
  ? Next extends '*'
    ? [string]
    : [string, ...InferPath<Next>]
  : [];

export type InferReturn<D extends HandlerData | undefined> = D extends HandlerData
  ? D['type'] extends 'json'
    ? any
    : D['type'] extends 'raw'
      ? Response
      : BodyInit
  : BodyInit

export type InferHandler<
  P extends string,
  D extends HandlerData | undefined,
  C,
> = Handler<
  InferPath<P>,
  Required<C>,
  InferReturn<D>
>;

export interface DefineHandler {
  <P extends string, const D extends HandlerData | undefined = undefined, C = {}>(
    path: P,
    handler: NoInfer<InferHandler<P, D, C>>,
    dat?: D,
  ): HandlerTag<C>;
}

// Unique tags
declare const handlerTag: unique symbol;
export interface HandlerTag<out T> {
  [handlerTag]: T;
}

/**
 * Return JSON
 */
export const json = {
  type: 'json',
} as const;

/**
 * Return HTML
 */
export const html = {
  type: 'html',
} as const;

/**
 * Return raw Response
 */
export const raw = {
  type: 'raw',
} as const;

/**
 * Handle errors of a router
 * @param f
 */
export const error = <const E extends Err, const D extends HandlerData | undefined = undefined>(
  r: RouterTag<E>,
  f: NoInfer<(err: E, c: Context) => InferReturn<D>>,
  dat?: D,
): RouterTag<never> => {
  // @ts-ignore
  r[2] = [f, dat];
  return r as any;
};

/**
 * Handle requests to a path with a specific method
 * @param method
 * @param path
 * @param handler
 * @param dat
 */
export const route = <P extends string, const D extends HandlerData | undefined = undefined, C = {}>(
  method: RequestMethod,
  path: P,
  handler: NoInfer<InferHandler<P, D, C>>,
  dat?: D,
): HandlerTag<C> => [method, path, handler, dat] as any;

// @ts-ignore
export const any: DefineHandler = (path, handler, dat) =>
  ['', path, handler, dat] as any;
// @ts-ignore
export const get: DefineHandler = (path, handler, dat) =>
  ['GET', path, handler, dat] as any;
// @ts-ignore
export const post: DefineHandler = (path, handler, dat) =>
  ['POST', path, handler, dat] as any;
// @ts-ignore
export const put: DefineHandler = (path, handler, dat) =>
  ['PUT', path, handler, dat] as any;
// @ts-ignore
export const del: DefineHandler = (path, handler, dat) =>
  ['DELETE', path, handler, dat] as any;
// @ts-ignore
export const patch: DefineHandler = (path, handler, dat) =>
  ['PATCH', path, handler, dat] as any;
// @ts-ignore
export const options: DefineHandler = (path, handler, dat) =>
  ['OPTIONS', path, handler, dat] as any;
// @ts-ignore
export const trace: DefineHandler = (path, handler, dat) =>
  ['TRACE', path, handler, dat] as any;

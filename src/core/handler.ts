import type { Err } from 'safe-throw';
import type { Context } from './context.js';
import { ALL } from '@mapl/router/method/index.js';
import { proto, type Tag } from './utils.js';
import type { RouterTag } from './index.js';

export type ErrorHandler<E extends Err = Err> = (err: E, c: Context) => any;

export type Handler<
  Params extends string[] = string[],
  T extends {} = Record<string, any>,
> = (...args: [...params: Params, c: Context & T]) => any;

export type DefineHandler = <P extends string, S = {}>(
  path: P,
  handler: Handler<InferPath<P>, Required<S>>,
  ...dat: HandlerData[]
) => HandlerTag<S>;

export interface HandlerData extends Record<symbol, any> {
  type?: 'json' | 'html' | 'raw';
}

export type InferPath<T extends string> = T extends `${string}*${infer Next}`
  ? Next extends '*'
    ? [string]
    : [string, ...InferPath<Next>]
  : [];

// Unique tags
declare const handlerTag: unique symbol;
export type HandlerTag<T> = Tag<T, typeof handlerTag>;

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
export const error = <const E extends Err>(
  r: RouterTag<E>,
  f: ErrorHandler<E>,
  ...dat: HandlerData[]
): RouterTag<never> => {
  // @ts-ignore
  r[2] = [f, proto(...dat)];
  return r as any;
};

/**
 * Handle requests to a path with a specific method
 * @param method
 * @param path
 * @param handler
 * @param dat
 */
export const route = <P extends string, S = {}>(
  method: string,
  path: P,
  handler: Handler<InferPath<P>, Required<S>>,
  ...dat: HandlerData[]
): HandlerTag<S> => [method, path, handler, proto(...dat)] as any;

export const any: DefineHandler = (...a) => route(ALL as any, ...a) as any;
export const get: DefineHandler = (...a) => route('GET', ...a) as any;
export const post: DefineHandler = (...a) => route('POST', ...a) as any;
export const put: DefineHandler = (...a) => route('PUT', ...a) as any;
export const del: DefineHandler = (...a) => route('DELETE', ...a) as any;
export const patch: DefineHandler = (...a) => route('PATCH', ...a) as any;
export const options: DefineHandler = (...a) => route('OPTIONS', ...a) as any;
export const trace: DefineHandler = (...a) => route('TRACE', ...a) as any;

import type { Err } from '@safe-std/error';
import type { Context } from './context.js';
import type { RouterTag } from './index.js';
import type { RequestMethod } from './utils.js';

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
  type?: 'json' | 'html' | 'raw' | null;
}

export type InferPath<T extends string> = T extends `${string}*${infer Next}`
  ? Next extends '*'
    ? [string]
    : [string, ...InferPath<Next>]
  : [];

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

const noType = { type: null };

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
  r[2] = [f, dat.length === 0 ? noType : Object.assign({ type: null }, ...dat)];
  return r as any;
};

const mergeData = (...dat: HandlerData[]) =>
  dat.length === 0 ? noType : Object.assign({ type: null }, ...dat);

/**
 * Handle requests to a path with a specific method
 * @param method
 * @param path
 * @param handler
 * @param dat
 */
export const route = <P extends string, S = {}>(
  method: RequestMethod,
  path: P,
  handler: Handler<InferPath<P>, Required<S>>,
  ...dat: HandlerData[]
): HandlerTag<S> => [method, path, handler, mergeData(...dat)] as any;

export const any: DefineHandler = (path, handler, ...dat) =>
  ['', path, handler, mergeData(...dat)] as any;
export const get: DefineHandler = (path, handler, ...dat) =>
  ['GET', path, handler, mergeData(...dat)] as any;
export const post: DefineHandler = (path, handler, ...dat) =>
  ['POST', path, handler, mergeData(...dat)] as any;
export const put: DefineHandler = (path, handler, ...dat) =>
  ['PUT', path, handler, mergeData(...dat)] as any;
export const del: DefineHandler = (path, handler, ...dat) =>
  ['DELETE', path, handler, mergeData(...dat)] as any;
export const patch: DefineHandler = (path, handler, ...dat) =>
  ['PATCH', path, handler, mergeData(...dat)] as any;
export const options: DefineHandler = (path, handler, ...dat) =>
  ['OPTIONS', path, handler, mergeData(...dat)] as any;
export const trace: DefineHandler = (path, handler, ...dat) =>
  ['TRACE', path, handler, mergeData(...dat)] as any;

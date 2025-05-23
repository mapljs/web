import type { Err } from 'safe-throw';
import type { Context } from './context.js';
import { ALL } from '@mapl/router/method/index.js';
import { proto } from './utils.js';

export type ErrorHandler<
  E extends Err = Err,
  T extends {} = Record<string, any>,
> = (err: E, c: Context & T) => any;

export type Handler<
  Params extends string[] = string[],
  T extends {} = Record<string, any>,
> = (...args: [...params: Params, c: Context & T]) => any;

export type DefineHandler = <P extends string, S = {}>(
  path: P,
  handler: Handler<InferPath<P>, Required<S>>,
  ...dat: HandlerData[]
) => Tag<S>;

export interface HandlerData extends Record<symbol, any> {
  type?: 'json' | 'html' | 'raw';
}

export type InferPath<T extends string> = T extends `${string}*${infer Next}`
  ? Next extends '*'
    ? [string]
    : [string, ...InferPath<Next>]
  : [];

export type MiddlewareHandler = (c: Context) => any;

// Type info for middleware and router
export type TypeInfo<E = never, S = {}> = [err: E, state: S];
export type AnyTypeInfo = TypeInfo<any, any>;
export type MergeTypeInfo<T extends AnyTypeInfo[]> = T extends [
  infer First extends TypeInfo,
  ...infer Rest extends TypeInfo[],
]
  ? [First[0] | MergeTypeInfo<Rest>[0], First[1] & MergeTypeInfo<Rest>[1]]
  : [never, {}];

// Unique tags
declare const tag: unique symbol;
export interface Tag<S> {
  readonly [tag]: S;
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
 * Handle requests to a path with a specific method
 * @param method
 * @param path
 * @param handler
 * @param dat
 */
export const on = <P extends string, S = {}>(
  method: string,
  path: P,
  handler: Handler<InferPath<P>, Required<S>>,
  ...dat: HandlerData[]
): Tag<S> => [method, path, handler, proto(...dat)] as any;

export const any: DefineHandler = (...a) => on(ALL as any, ...a) as any;
export const get: DefineHandler = (...a) => on('GET', ...a) as any;
export const post: DefineHandler = (...a) => on('POST', ...a) as any;
export const put: DefineHandler = (...a) => on('PUT', ...a) as any;
export const del: DefineHandler = (...a) => on('DELETE', ...a) as any;
export const patch: DefineHandler = (...a) => on('PATCH', ...a) as any;
export const options: DefineHandler = (...a) => on('OPTIONS', ...a) as any;
export const trace: DefineHandler = (...a) => on('TRACE', ...a) as any;

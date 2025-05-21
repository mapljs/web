import type { Group, Middleware } from '@mapl/framework';
import type { Err } from 'safe-throw';
import type { Context } from './context.js';

export type ErrorHandler<
  E extends Err = Err,
  T extends {} = Record<string, any>,
> = (err: E, c: Context & T) => any;

export type Handler<
  Params extends string[] = string[],
  T extends {} = Record<string, any>,
> = (...args: [...params: Params, c: Context & T]) => any;

export type MiddlewareHandler = (c: Context) => any;
export type MiddlewareTypes<E = never, S = {}> = [err: E, state: S];
export type AnyMiddlewareTypes = MiddlewareTypes<any, any>;

export type MergeMiddlewareTypes<T extends AnyMiddlewareTypes[]> = T extends [
  infer First extends AnyMiddlewareTypes,
  ...infer Rest extends AnyMiddlewareTypes[],
]
  ? [
      First[0] | MergeMiddlewareTypes<Rest>[0],
      First[1] & MergeMiddlewareTypes<Rest>[1],
    ]
  : [never, {}];

export interface HandlerData extends Record<symbol, any> {
  type?: 'json' | 'html' | 'raw';
}

export type InferPath<T extends string> = T extends `${string}*${infer Next}`
  ? Next extends '*'
    ? [string]
    : [string, ...InferPath<Next>]
  : [];

export type RequestMethod =
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'OPTIONS'
    | 'TRACE';

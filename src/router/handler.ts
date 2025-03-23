import type { Group } from '@mapl/framework';
import type { Err } from 'safe-throw';
import type { Context } from './context';

export type ErrorFunc<
  E extends Err = Err,
  T extends {} = Record<string, any>,
  Args extends any[] = any[]
> = (err: E, c: Context & T, ...args: Args) => any;

export type HandlerFunc<
  Params extends string[] = string[],
  T extends {} = Record<string, any>,
  Args extends any[] = any[]
> = (...args: [...params: Params, c: Context & T, ...args: Args]) => any;

export type MiddlewareFunc<
  T extends {} = Record<string, any>,
  Args extends any[] = any[]
> = (c: Context & T, ...args: Args) => any;

/**
 * Basic information to compile
 */
export interface Data {
  type?: 'json' | 'html' | 'raw';
}

export type HandlerData = Data & Record<symbol, any>;
export type HandlerGroup = Group<ErrorFunc, HandlerFunc, HandlerData>;

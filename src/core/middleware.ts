import type { ScopeState } from '@mapl/framework';
import type { InferErr, InferResult } from '@safe-std/error';

import type { AwaitedReturn } from './utils.js';
import type { Context } from './context.js';
import { noOp } from 'runtime-compiler';

export type MiddlewareHandler = (c: Context) => any;
export type MiddlewareTypes<E, S> = [err: E, state: S];
export type AnyMiddlewareTypes = MiddlewareTypes<any, any>;

export const macro = <E = never, S = {}>(
  f: (scope: ScopeState) => string,
): MiddlewareTypes<E, S> => [-1, f] as any;
export const noOpMacro: MiddlewareTypes<never, {}> = macro(noOp);

export const tap = (f: MiddlewareHandler): MiddlewareTypes<never, {}> =>
  [0, f] as any;

export const attach = <Prop extends string, const T extends MiddlewareHandler>(
  prop: Prop,
  f: T,
): MiddlewareTypes<never, Record<Prop, AwaitedReturn<T>>> =>
  [1, f, prop] as any;

export const validate = <const T extends MiddlewareHandler>(
  f: T,
): MiddlewareTypes<InferErr<AwaitedReturn<T>>, {}> => [2, f] as any;

export const parse = <Prop extends string, const T extends MiddlewareHandler>(
  prop: Prop,
  f: T,
): MiddlewareTypes<
  InferErr<AwaitedReturn<T>>,
  Record<Prop, InferResult<AwaitedReturn<T>>>
> => [3, f, prop] as any;

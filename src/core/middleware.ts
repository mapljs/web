import type { ScopeState } from '@mapl/framework';

import type { AwaitedReturn } from './utils.js';
import type { Context } from './context.js';
import { noOp } from 'runtime-compiler';
import type { InferErr, InferResult } from '@safe-std/error';

declare const _: unique symbol;
export interface MiddlewareTypes<out Context, in out Err, in out State> {
  [_]: [Context, Err, State];
}
export type AnyMiddlewareTypes = MiddlewareTypes<any, any, any>;

export type InferMiddlewareState<T extends AnyMiddlewareTypes> = T[typeof _][2];
export type InferMiddlewareErr<T extends AnyMiddlewareTypes> = T[typeof _][1];

export type MiddlewareHandler<C> = (c: Context & C) => any;

export const macro = <C, E = never, S = {}>(
  f: (scope: ScopeState) => string,
): MiddlewareTypes<C, E, S> => [-1, f] as any;
export const noOpMacro: MiddlewareTypes<any, never, {}> = macro(noOp);

export const tap = <C>(
  f: MiddlewareHandler<C>,
): MiddlewareTypes<C, never, {}> => [0, f] as any;

export const attach = <
  C,
  Prop extends string,
  const T extends MiddlewareHandler<C>,
>(
  prop: Prop,
  f: T,
): MiddlewareTypes<C, never, Record<Prop, AwaitedReturn<T>>> =>
  [1, f, prop] as any;

export const validate = <C, const T extends MiddlewareHandler<C>>(
  f: T,
): MiddlewareTypes<C, InferErr<AwaitedReturn<T>>, {}> => [2, f] as any;

export const parse = <
  C,
  Prop extends string,
  const T extends MiddlewareHandler<C>,
>(
  prop: Prop,
  f: T,
): MiddlewareTypes<
  C,
  InferErr<AwaitedReturn<T>>,
  Record<Prop, InferResult<AwaitedReturn<T>>>
> => [3, f, prop] as any;

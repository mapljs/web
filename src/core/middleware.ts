import type { MiddlewareHandler, MiddlewareTypes } from './handler.js';
import type { InferErr } from 'safe-throw';
import type { AwaitedReturn } from './utils.js';

export const run = (f: MiddlewareHandler): MiddlewareTypes => [0, f] as any;

export const attach = <Prop extends string, const T extends MiddlewareHandler>(
  prop: Prop,
  f: T,
): MiddlewareTypes<never, Record<Prop, AwaitedReturn<T>>> =>
  [1, f, prop] as any;

export const validate = <const T extends MiddlewareHandler>(
  f: T,
): MiddlewareTypes<InferErr<AwaitedReturn<T>>> => [2, f] as any;

export const parse = <Prop extends string, const T extends MiddlewareHandler>(
  prop: Prop,
  f: T,
): MiddlewareTypes<
  InferErr<AwaitedReturn<T>>,
  Record<Prop, AwaitedReturn<T>>
> => [3, f] as any;

import type { MiddlewareHandler, Tag, TypeInfo } from './handler.js';
import type { InferErr } from 'safe-throw';
import type { AwaitedReturn } from './utils.js';

export type MiddlewareTag = Tag<{ readonly 0: unique symbol }>;

export const tap = (f: MiddlewareHandler): TypeInfo & MiddlewareTag =>
  [0, f] as any;

export const attach = <Prop extends string, const T extends MiddlewareHandler>(
  prop: Prop,
  f: T,
): TypeInfo<never, Record<Prop, AwaitedReturn<T>>> & MiddlewareTag =>
  [1, f, prop] as any;

export const validate = <const T extends MiddlewareHandler>(
  f: T,
): TypeInfo<InferErr<AwaitedReturn<T>>> & MiddlewareTag => [2, f] as any;

export const parse = <Prop extends string, const T extends MiddlewareHandler>(
  prop: Prop,
  f: T,
): TypeInfo<InferErr<AwaitedReturn<T>>, Record<Prop, AwaitedReturn<T>>> &
  MiddlewareTag => [3, f] as any;

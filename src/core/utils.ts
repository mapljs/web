export type UnionToIntersection<U> = (
  U extends any
    ? (x: U) => void
    : never
) extends (x: infer I) => void
  ? I
  : never;
export type AwaitedReturn<U extends (...a: any[]) => any> = Awaited<
  ReturnType<U>
>;
export type ToNever<T> = unknown extends T ? never : T;
export type Tag<S, T extends symbol> = Record<T, S>;
export const proto = <T extends any[]>(
  ...f: T
): UnionToIntersection<T[number]> => Object.assign(Object.create(null), ...f);

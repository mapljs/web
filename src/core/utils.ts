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
export const proto = <A extends {}, T extends any[]>(
  a: A,
  ...f: T
): A & UnionToIntersection<T[number]> => Object.assign({ ...a }, ...f);

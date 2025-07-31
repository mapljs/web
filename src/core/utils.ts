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

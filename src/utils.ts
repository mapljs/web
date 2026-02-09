export type NonEmptyArray<T> = [T, ...T[]];

export const argsToArray = <T extends any[]>(...args: T): T => args;

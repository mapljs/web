import type { Identifier } from 'runtime-compiler';

export type InferDependencies<T extends Identifier<any>[]> = {
  [K in keyof T]: T[K]['~type'];
};

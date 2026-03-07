import { declareLocal, injectExternal, type Identifier } from 'runtime-compiler';
import type { BaseScope } from '../router.ts';

export type InferDependencies<T extends Identifier<any>[]> = {
  [K in keyof T]: T[K]['~type'];
};

export const injectValue = <T>(v: T, scope: BaseScope): Identifier<T> =>
  declareLocal(scope[6], injectExternal(v));

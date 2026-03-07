import { declareLocal, injectExternal, type Identifier } from 'runtime-compiler';
import type { BaseScope, Route } from '../router.ts';

export const PARAMS_MAP: string[] = ['', `${constants.PARAMS}0`];
for (let i = 1; i <= 16; i++) PARAMS_MAP.push(`${PARAMS_MAP[i]},${constants.PARAMS}${i}`);

export const injectValue = <T>(v: T, route: Route): Identifier<T> =>
  declareLocal(route[6], injectExternal(v));

export type Dependency<T = any> = Identifier<T> | ((scope: BaseScope) => Identifier<T>);
type ReturnTypeIfExists<T> = T extends (...args: any) => infer R ? R : T;
export type InferDependencies<T extends Dependency[]> = {
  [K in keyof T]: ReturnTypeIfExists<T[K]>['~type'];
};

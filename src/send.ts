import type { Dependency, InferDependencies } from './compiler/utils.ts';
import type { Route } from './router.ts';

/**
 * Describe a header pair
 */
export type ResponseHeader = [string, string] | readonly [string, string];

/**
 * Response state
 */
export interface ResponseState {
  status: number;
  headers: ResponseHeader[];
  statusText: string;
}

export const body: <Params extends any[], const Deps extends Dependency<any>[]>(
  route: Route<Params>,
  f: (...args: [...InferDependencies<Deps>, ...Params, res: ResponseState]) => BodyInit,
  ...args: Deps
) => void = (route, f, ...args) => {};

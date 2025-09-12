import { externalDependencies } from '@mapl/framework';
import { isHydrating } from './config.js';

export type LocalDependency<T = unknown> = number & [T];

// Compile dependencies
/**
 * @internal
 */
export const compiledDeps: readonly any[] = [];

let localDeps = '',
  localDepsCnt = 0;

/**
 * Inject a dependency
 */
export const injectLocalDependency: <T>(val: string) => LocalDependency<T> = (
  val,
) => {
  if (!isHydrating()) localDeps += constants.LOCAL_DEPS + '.push(' + val + ');';
  return localDepsCnt++ as any;
};

/**
 * @internal
 */
export const localDependencies = (): string => localDeps;

/**
 * Get local dependency value
 * @param i
 */
export const localDependency = <T>(i: LocalDependency<T>): T => compiledDeps[i];

/**
 * @internal
 */
export const stateToArgs = (): string => {
  let depsString =
    constants.IS_ERR + ',' + constants.CTX_FN + ',' + constants.LOCAL_DEPS;

  for (let i = 0; i < externalDependencies.length; i++)
    depsString += ',' + constants.DEP + (i + 1);

  return depsString;
};

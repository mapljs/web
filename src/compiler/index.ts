import { externalDependencies } from '@mapl/framework';
import { isHydrating } from './config.js';

let localDeps = '',
  localDepsCnt = 0;
export const injectLocalDependency: (val: string) => number = isHydrating()
  ? () => ++localDepsCnt
  : (val) => {
      localDepsCnt++;
      localDeps += ',' + constants.LOCAL_DEP + localDepsCnt + '=' + val;
      return localDepsCnt;
    };
export const localDependencies = (): string => localDeps;

export const stateToArgs = (): string => {
  let depsString = constants.IS_ERR + ',' + constants.CTX_FN;

  for (let i = 0; i < externalDependencies.length; i++)
    depsString += ',' + constants.DEP + (i + 1);

  return depsString;
};

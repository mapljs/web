import { getDeps } from 'runtime-compiler/call';
import type { State } from './state.ts';
import { injectExternalDependency } from 'runtime-compiler';
import { AsyncFunction } from 'runtime-compiler/utils';

/**
 * Compile a function to call statement.
 * Use in `default` and `build` mode.
 */
export const buildCall = (
  state: State,
  fn: (...args: any[]) => any,
  paramCount: number,
  params: string,
): string => {
  let fnId = injectExternalDependency(fn) as string;
  if (fn instanceof AsyncFunction) {
    state[0] = true;
    fnId = 'await ' + fnId;
  }

  const deps = getDeps(fn);
  return deps == null
    ? fn.length > paramCount
      ? ((state[1] = true), `${fnId}(${params}${constants.CTX})`)
      : `${fnId}(${params})`
    : fn.length > paramCount + deps.length
      ? ((state[1] = true), `${fnId}(${deps.join()},${params}${constants.CTX})`)
      : `${fnId}(${deps.join()},${params})`;
};

/**
 * Hydrate a call.
 */
export const hydrateCall = (
  state: State,
  fn: (...args: any[]) => any,
  paramCount: number,
): void => {
  injectExternalDependency(fn);
  state[0] ||= fn instanceof AsyncFunction;

  const deps = getDeps(fn);
  state[1] ||=
    fn.length > (deps == null ? paramCount : deps.length + paramCount);
};

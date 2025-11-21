import { getDeps } from 'runtime-compiler/call';
import type { State } from './state.ts';
import { injectExternalDependency } from 'runtime-compiler';
import { AsyncFunction } from 'runtime-compiler/utils';

/**
 * Compile a function to call statement.
 * Use in `default` and `build` mode.
 *
 * @example
 * buildCall([true, true], (err, c) => { ... }, 'e0', 'e0,c');
 */
export const buildCall = (
  state: State,
  fn: (...args: any[]) => any,
  paramCount: number,
  paramMap: string[],
): string => {
  let fnId = injectExternalDependency(fn);
  if (fn instanceof AsyncFunction) {
    state[0] = true;
    fnId = 'await ' + fnId;
  }

  const deps = getDeps(fn);
  return deps == null
    ? fn.length > paramCount
      ? ((state[1] = true), `${fnId}(${paramMap[(paramCount << 1) | 1]})`)
      : `${fnId}(${paramMap[paramCount << 1]})`
    : fn.length > paramCount + deps.length
      ? ((state[1] = true),
        `${fnId}(${deps.join()},${paramMap[(paramCount << 1) | 1]})`)
      : `${fnId}(${deps.join()},${paramMap[paramCount << 1]})`;
};

/**
 * Hydrate an fn.
 * Use in `hydrate` mode.
 *
 * @example
 * hydrateCall([true, true], (err, c) => { ... });
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

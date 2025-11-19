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
  params: string,
  paramsWithCtx: string,
): string => {
  let fnId = injectExternalDependency(fn);
  if (fn instanceof AsyncFunction) {
    state[0] = true;
    fnId = 'await ' + fnId;
  }

  const deps = getDeps(fn);
  return deps == null
    ? fn.length > 0
      ? ((state[1] = true), `${fnId}(${paramsWithCtx})`)
      : `${fnId}(${params})`
    : fn.length > deps.length
      ? ((state[1] = true), `${fnId}(${deps.join()},${paramsWithCtx})`)
      : `${fnId}(${deps.join()},${params})`;
};

/**
 * Compile a function to call statement.
 * Use in `default` and `build` mode.
 *
 * @example
 * buildCallNoAwait([true, true], (err, c) => { ... }, 'e0', 'e0,c');
 */
export const buildCallNoAwait = (
  state: State,
  fn: (...args: any[]) => any,
  params: string,
  paramsWithCtx: string,
): string => {
  const fnId = injectExternalDependency(fn);
  const deps = getDeps(fn);

  return deps == null
    ? fn.length > 0
      ? ((state[1] = true), `${fnId}(${paramsWithCtx})`)
      : `${fnId}(${params})`
    : fn.length > deps.length
      ? ((state[1] = true), `${fnId}(${deps.join()},${paramsWithCtx})`)
      : `${fnId}(${deps.join()},${params})`;
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
): void => {
  injectExternalDependency(fn);
  state[0] ||= fn instanceof AsyncFunction;

  const deps = getDeps(fn);
  state[1] ||= fn.length > (deps == null ? 0 : deps.length);
};

/**
 * Hydrate an fn.
 * Use in `hydrate` mode.
 *
 * @example
 * hydrateCallNoAwait([true, true], (err, c) => { ... });
 */
export const hydrateCallNoAwait = (
  state: State,
  fn: (...args: any[]) => any,
): void => {
  injectExternalDependency(fn);

  const deps = getDeps(fn);
  state[1] ||= fn.length > (deps == null ? 0 : deps.length);
};

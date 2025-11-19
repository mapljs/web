import { injectDependency } from 'runtime-compiler';

export interface State {
  /**
   * Whether scope should be async
   */
  0: boolean;

  /**
   * Whether the scope needs a context object
   */
  1: boolean;

  /**
   * Fork the current state
   */
  slice: () => State;
}

/**
 * Create initial state
 */
export const initState = (): State => [false, false] as any;

/**
 * Use in `default` and `build` mode.
 *
 * @example
 * finalizeReturn([true, true], 'return await fn(c);', '(req, server)');
 */
export const finalizeReturn = (
  state: State,
  content: string,
  callArgs: string,
): string =>
  state[0]
    ? 'return ' +
      injectDependency(
        `async${callArgs}=>{${state[1] ? constants.CREATE_CTX + content : content}}`,
      ) +
      callArgs
    : state[1]
      ? constants.CREATE_CTX + content
      : content;

/**
 * Use in `default` and `build` mode.
 *
 * @example
 * finalizeFn([true, true], 'return await fn(c);', '(req, server)');
 */
export const finalizeFn = (
  state: State,
  content: string,
  callArgs: string,
): string =>
  injectDependency(
    `${state[0] ? 'async' + callArgs : callArgs}=>{${state[1] ? constants.CREATE_CTX + content : content}}`,
  );

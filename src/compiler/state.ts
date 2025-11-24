import { injectDependency } from 'runtime-compiler';
import { handlerArgs } from './globals.ts';

export interface State extends Array<any> {
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
  slice: () => this;
}

/**
 * Create initial state
 */
export const initState = (): State => [false, false] as any;

/**
 * Use in `default` and `build` mode.
 *
 * @example
 * finalizeReturn([true, true], 'return await fn(c);');
 */
export const finalizeReturn = (state: State, content: string): string =>
  state[0]
    ? 'return ' +
      injectDependency(
        `async${handlerArgs}=>{${state[1] ? constants.CREATE_CTX + content : content}}`,
      ) +
      handlerArgs
    : state[1]
      ? constants.CREATE_CTX + content
      : content;

/**
 * Use in `default` and `build` mode.
 *
 * @example
 * finalizeFn([true, true], 'return await fn(c);');
 */
export const finalizeFn = (state: State, content: string): string =>
  injectDependency(
    `${state[0] ? 'async' + handlerArgs : handlerArgs}=>{${state[1] ? constants.CREATE_CTX + content : content}}`,
  );

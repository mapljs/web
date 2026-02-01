import { declareLocal } from 'runtime-compiler';
import { HANDLER_ARGS, SCOPE } from './globals.ts';

/**
 * Handler scope state.
 */
export interface HandlerScope {
  /**
   * Scope flags.
   *
   * bit 0: scope requires async or not
   * bit 1: scope requires context or not
   */
  0: number;

  slice: () => this;
}

export const wrapScope = (scope: HandlerScope, content: string): string => {
  const flags = scope[0];
  (flags & 2) === 2 && (content = constants.CREATE_CTX + content);
  return (flags & 1) === 1
    ? 'return ' +
        declareLocal(
          SCOPE,
          ('async' + HANDLER_ARGS + '=>{' + content + '}') as any,
        ) +
        HANDLER_ARGS
    : content;
};

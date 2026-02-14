import { declareLocal, type Scope } from 'runtime-compiler';
import { HANDLER_ARGS, TMP_SCOPE } from './globals.ts';

/**
 * Handler scope state.
 */
export interface HandlerScope extends Scope {
  /**
   * Scope flags.
   *
   * Bit positions:
   * - `0`: whether scope requires async.
   * - `1`: scope requires context or not.
   */
  2: number;
}

export const initScope: HandlerScope = ['', 0, 0] as any;

export const wrapScope = (scope: HandlerScope): string => {
  let content = scope[0];
  const flags = scope[2];
  (flags & 2) === 2 && (content = constants.CREATE_CTX + content);
  return (flags & 1) === 1
    ? 'return ' +
        declareLocal(
          TMP_SCOPE,
          ('async' + HANDLER_ARGS + '=>{' + content + '}') as any,
        ) +
        HANDLER_ARGS
    : content;
};

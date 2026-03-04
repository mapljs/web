import type { Scope } from 'runtime-compiler';

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

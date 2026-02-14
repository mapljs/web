import {
  declareLocal,
  injectExternal,
  type Identifier,
  type Scope,
} from 'runtime-compiler';
import { isErr } from '@safe-std/error';

/**
 * @example
 * '(req,env,ctx)'
 */
export let HANDLER_ARGS: string;

/**
 * @example
 * setHandlerArgs('(req,env,ctx)');
 */
export const setHandlerArgs = (str: string): void => {
  HANDLER_ARGS = str;
};

/**
 * Store local variables
 */
export let TMP_SCOPE: Scope;

/**
 * Check whether value is an error
 */
export let IS_ERR: Identifier<typeof isErr>;

export const initGlobalScope = (): void => {
  TMP_SCOPE = [constants.DECL_GLOBALS, 0] as any;
  IS_ERR = declareLocal(TMP_SCOPE, injectExternal(isErr)) as any;
};

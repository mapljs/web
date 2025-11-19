import { isHydrating } from 'runtime-compiler/config';

import type { Context, MaybePromise } from './types.ts';
import type { RouteLayer } from '../compiler/router.ts';
import { buildCall, hydrateCall } from '../compiler/call.ts';

// Build args for faster compilation
const paramArgs = ['', constants.PARAMS + 0];
const paramArgsWithCtx = [
  constants.CTX,
  constants.PARAMS + 0 + ',' + constants.CTX,
];
for (let i = 1; i <= 9; i++) {
  const args = `${paramArgs[i]},${constants.PARAMS + i}`;
  paramArgs.push(args);
  paramArgsWithCtx.push(args + ',' + constants.CTX);
}

// Send text and streams
type SendFn<Params extends string[]> = (
  ...args: [...Params, c: Context]
) => MaybePromise<BodyInit | null>;
export const sendFn: RouteLayer[0] = isHydrating
  ? (data, state) => (hydrateCall(state, data[1]), '')
  : (data, state, paramCount) => {
      const call = buildCall(
        state,
        data[1],
        paramArgs[paramCount],
        paramArgsWithCtx[paramCount],
      );
      return state[1]
        ? `return new Response(${call},${constants.CTX})`
        : `return new Response(${call})`;
    };
export const raw = <Params extends string[]>(
  fn: SendFn<Params>,
): RouteLayer<Params> => [sendFn, fn];

// Send JSON
type SendJSONFn<Params extends string[]> = (
  ...args: [...Params, c: Context]
) => any;
export const sendJSONFn: RouteLayer[0] = isHydrating
  ? (data, state) => (hydrateCall(state, data[1]), '')
  : (data, state, paramCount) => {
      const call = buildCall(
        state,
        data[1],
        paramArgs[paramCount],
        paramArgsWithCtx[paramCount],
      );
      return state[1]
        ? `${constants.HEADERS}.push(${constants.JSON_HEADER});return new Response(${call},${constants.CTX})`
        : `return new Response(${call},${constants.JSON_OPTION})`;
    };
export const json = <Params extends string[]>(
  fn: SendJSONFn<Params>,
): RouteLayer<Params> => [sendJSONFn, fn];

// Send HTML
export const sendHTMLFn: RouteLayer[0] = isHydrating
  ? (data, state) => (hydrateCall(state, data[1]), '')
  : (data, state, paramCount) => {
      const call = buildCall(
        state,
        data[1],
        paramArgs[paramCount],
        paramArgsWithCtx[paramCount],
      );
      return state[1]
        ? `${constants.HEADERS}.push(${constants.HTML_HEADER});return new Response(${call},${constants.CTX})`
        : `return new Response(${call},${constants.HTML_OPTION})`;
    };
export const html = <Params extends string[]>(
  fn: SendFn<Params>,
): RouteLayer<Params> => [sendHTMLFn, fn];

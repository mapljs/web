import { isHydrating } from 'runtime-compiler/config';

import type { Context, MaybePromise } from './types.ts';
import type { RouteLayer } from '../compiler/router.ts';
import { buildCall, hydrateCall } from '../compiler/call.ts';

// Send text and streams
type SendFn<Params extends any[]> = (
  ...args: [...Params, c: Context]
) => MaybePromise<BodyInit | null>;
export const sendFn: RouteLayer<any[]>[0] = isHydrating
  ? (data, state, paramCount) => (hydrateCall(state, data[1], paramCount), '')
  : (data, state, paramCount, paramMap) => {
      const call = buildCall(state, data[1], paramCount, paramMap);
      return state[1]
        ? `return new Response(${call},${constants.CTX})`
        : `return new Response(${call})`;
    };
export const raw = <Params extends any[]>(
  fn: SendFn<Params>,
): RouteLayer<Params> => [sendFn, fn];

// Send JSON
type SendJSONFn<Params extends any[]> = (
  ...args: [...Params, c: Context]
) => any;
export const sendJSONFn: RouteLayer<any[]>[0] = isHydrating
  ? (data, state, paramCount) => (hydrateCall(state, data[1], paramCount), '')
  : (data, state, paramCount, paramMap) => {
      const call = buildCall(state, data[1], paramCount, paramMap);
      return state[1]
        ? `${constants.HEADERS}.push(${constants.JSON_HEADER});return new Response(${call},${constants.CTX})`
        : `return new Response(${call},${constants.JSON_OPTION})`;
    };
export const json = <Params extends any[]>(
  fn: SendJSONFn<Params>,
): RouteLayer<Params> => [sendJSONFn, fn];

// Send HTML
export const sendHTMLFn: RouteLayer<any[]>[0] = isHydrating
  ? (data, state, paramCount) => (hydrateCall(state, data[1], paramCount), '')
  : (data, state, paramCount, paramMap) => {
      const call = buildCall(state, data[1], paramCount, paramMap);
      return state[1]
        ? `${constants.HEADERS}.push(${constants.HTML_HEADER});return new Response(${call},${constants.CTX})`
        : `return new Response(${call},${constants.HTML_OPTION})`;
    };
export const html = <Params extends any[]>(
  fn: SendFn<Params>,
): RouteLayer<Params> => [sendHTMLFn, fn];

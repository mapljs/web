import { isHydrating } from 'runtime-compiler/config';

import type { Context, MaybePromise } from './types.ts';

import type { RouteLayer } from '../compiler/router.ts';
import { buildCall, hydrateCall } from '../compiler/call.ts';
import type { State } from '../compiler/state.ts';

const onlyHydrateCall = (data: any[], state: State, paramCount: number) => (
  hydrateCall(state, data[1], paramCount), ''
);

// Send text and streams
type SendFn<Params extends any[]> = (
  ...args: [...Params, c: Context]
) => MaybePromise<BodyInit | null>;
export const sendFn: RouteLayer<any[]>[0] = isHydrating
  ? onlyHydrateCall
  : (data, state, paramCount, params) => {
      const call = buildCall(state, data[1], paramCount, params);
      return state[1]
        ? `return new Response(${call},${constants.CTX})`
        : `return new Response(${call})`;
    };

/**
 * Send raw content
 */
export const raw = <Params extends any[]>(
  fn: SendFn<Params>,
): RouteLayer<Params> => [sendFn, fn];

// Send JSON
type SendJSONFn<Params extends any[]> = (
  ...args: [...Params, c: Context]
) => any;
export const sendJSONFn: RouteLayer<any[]>[0] = isHydrating
  ? onlyHydrateCall
  : (data, state, paramCount, params) => {
      const call = buildCall(state, data[1], paramCount, params);
      return state[1]
        ? `${constants.HEADERS}.push(${constants.JSON_HEADER});return new Response(${call},${constants.CTX})`
        : `return new Response(${call},${constants.JSON_OPTION})`;
    };

/**
 * Send JSON
 */
export const json = <Params extends any[]>(
  fn: SendJSONFn<Params>,
): RouteLayer<Params> => [sendJSONFn, fn];

// Send HTML
export const sendHTMLFn: RouteLayer<any[]>[0] = isHydrating
  ? onlyHydrateCall
  : (data, state, paramCount, params) => {
      const call = buildCall(state, data[1], paramCount, params);
      return state[1]
        ? `${constants.HEADERS}.push(${constants.HTML_HEADER});return new Response(${call},${constants.CTX})`
        : `return new Response(${call},${constants.HTML_OPTION})`;
    };

/**
 * Send HTML
 */
export const html = <Params extends any[]>(
  fn: SendFn<Params>,
): RouteLayer<Params> => [sendHTMLFn, fn];

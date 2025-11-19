import { isHydrating } from 'runtime-compiler/config';

import type { Layer } from '../compiler/router.ts';
import type { Context } from './types.ts';
import { buildCall, hydrateCall } from '../compiler/call.ts';

export type TapFn = ((c: Context) => any) | (() => any);
const buildTap: Layer<[TapFn]>[0] = isHydrating
  ? (data, state) => (hydrateCall(state, data[1]), '')
  : (data, state) => buildCall(state, data[1], '', constants.CTX);
export const tap = (fn: TapFn): Layer<[TapFn]> => [buildTap, fn];

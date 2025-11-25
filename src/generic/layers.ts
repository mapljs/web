import { isHydrating } from 'runtime-compiler/config';

import type { Layer } from '../compiler/router.ts';
import { buildCall, hydrateCall } from '../compiler/call.ts';

import type { Context } from './types.ts';

const buildTap: Layer<[any]>[0] = isHydrating
  ? (data, state) => (hydrateCall(state, data[1], 0), '')
  : (data, state) => buildCall(state, data[1], 0, '') + ';';

/**
 * Run a function on every request
 */
export const tap = <const Fn extends (c: Context) => any>(
  fn: Fn,
): Layer<[Fn]> => [buildTap, fn];

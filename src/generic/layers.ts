import { isHydrating } from 'runtime-compiler/config';
import { injectExternalDependency, lazyDependency } from 'runtime-compiler';

import { Err, isErr, type InferErr } from '@safe-std/error';

import {
  EMPTY_PARAM_MAP,
  type Layer,
  type RouteLayer,
} from '../compiler/router.ts';
import type { Context } from './types.ts';
import { buildCall, hydrateCall } from '../compiler/call.ts';

export type TapFn = (c: Context) => any
const buildTap: Layer<[TapFn]>[0] = isHydrating
  ? (data, state) => (hydrateCall(state, data[1], 0), '')
  : (data, state) => buildCall(state, data[1], 0, EMPTY_PARAM_MAP) + ';';
export const tap = (fn: TapFn): Layer<[TapFn]> => [buildTap, fn];

// Error params
const ERROR_PARAM_MAP = [
  '',
  '',
  constants.TMP,
  `${constants.TMP},${constants.CTX}`,
];

/**
 * Lazy dependency of `isErr`.
 */
export const IS_ERR_DEP: () => string = lazyDependency(
  injectExternalDependency,
  isErr,
);

const buildValidate: Layer<[any, any]>[0] = isHydrating
  ? (data, state) => {
      hydrateCall(state, data[1], 0);
      IS_ERR_DEP();

      const layer = data[2] as RouteLayer<[any]>;
      layer[0](layer, state, 1, ERROR_PARAM_MAP);

      return '';
    }
  : (data, state) => {
      const layer = data[2] as RouteLayer<[any]>;

      return `{let ${constants.TMP}=${buildCall(
        state,
        data[1],
        0,
        EMPTY_PARAM_MAP,
      )};if(${IS_ERR_DEP()}(${constants.TMP})){${layer[0](layer, state, 1, ERROR_PARAM_MAP)}}}`;
    };
export const validate = <
  const Fn extends (c: Context) => any,
>(
  fn: Fn,
  onErr: RouteLayer<[InferErr<Awaited<ReturnType<Fn>>>]>,
): Layer<[Fn, any]> => [buildValidate, fn, onErr];

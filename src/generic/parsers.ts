import { type InferErr, type InferResult, isErr } from "@safe-std/error";

import { injectExternalDependency, type LocalDependency } from "runtime-compiler";
import { isHydrating } from "runtime-compiler/config";

import type { Context } from "./types.ts";
import { evaluateRouteLayer, type Layer, type RouteLayer } from "../compiler/router.ts";
import { buildCall, hydrateCall } from "../compiler/call.ts";

interface ParseLayerFn {
  <const T>(
    fn: (c: Context) => T,
    handleError: RouteLayer<[InferErr<Awaited<T>>]>,
  ): Layer<
    [LocalDependency<InferResult<Awaited<T>>>, typeof fn, typeof handleError]
  >;

  <const T>(
    fn: (c: Context) => T
  ): Layer<[LocalDependency<Awaited<T>>, typeof fn]>;
}

/**
 * Check whether value is an error
 */
export const IS_ERR: LocalDependency<typeof isErr> = injectExternalDependency(isErr);

const buildParse: Layer<[any, any]>[0] = isHydrating
  ? (data, state) => (
      hydrateCall(state, data[2], 0),
      data.length > 3
        ? evaluateRouteLayer(data[3], state, 1, data[1])
        : ''
    )
  : (data, state) => {
      const id = data[1];
      return (
        `let ${id}=${buildCall(state, data[2], 0, '')};` +
        (data.length > 3
          ? `if(${IS_ERR}(${id})){${evaluateRouteLayer(data[3], state, 1, id + ',')}}`
          : '')
      );
    };

let tmpId = 0;
/**
 * Parse and assign the value to a local variable on every request
 */
export const init: ParseLayerFn = (fn: any, handleError?: any) =>
  handleError == null
    ? [buildParse, constants.PARSED_RESULT + tmpId++, fn]
    : ([buildParse, constants.PARSED_RESULT + tmpId++, fn, handleError] as any);

/**
 * Get the parsed result of a parser
 */
export const result = <T extends LocalDependency<any>>(parser: Layer<[T, ...any[]]>): T => parser[1];

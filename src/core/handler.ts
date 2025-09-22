import type { Err } from '@safe-std/error';
import type { Context } from './context.js';
import type { RouterTag } from './index.js';
import { noOp, type RequestMethod } from './utils.js';
import { isHydrating } from 'runtime-compiler/config';
import { injectDependency, lazyDependency } from 'runtime-compiler';

export type HandlerResponse<I = any> = (
  response: string,
  hasContext: boolean,
  _?: I,
) => string;

export interface HandlerData extends Record<symbol, any> {
  type?: HandlerResponse;
}

export type Handler<
  Params extends string[] = string[],
  T extends {} = Record<string, any>,
  R = any,
> = (...args: [...params: Params, c: Context & T]) => R;

export type InferPath<T extends string> = T extends `${string}*${infer Next}`
  ? Next extends '*'
    ? [string]
    : [string, ...InferPath<Next>]
  : [];

// toResponse macro
export type InferReturn<D extends HandlerData | undefined> =
  D extends HandlerData
    ? D['type'] extends HandlerResponse<infer I>
      ? I
      : Response
    : Response;

export type InferHandler<
  P extends string,
  D extends HandlerData | undefined,
  C,
> = Handler<InferPath<P>, Required<C>, InferReturn<D>>;

export interface DefineHandler {
  <
    P extends string,
    const D extends HandlerData | undefined = undefined,
    C = {},
  >(
    path: P,
    handler: NoInfer<InferHandler<P, D, C>>,
    dat?: D,
  ): HandlerTag<C>;
}

// Unique tags
declare const handlerTag: unique symbol;
export interface HandlerTag<out T> {
  [handlerTag]: T;
}

const JSON_HEADER = isHydrating ? noOp : lazyDependency(injectDependency, '["content-type","application/json"]');
const JSON_OPTIONS = isHydrating ? noOp : lazyDependency(injectDependency, '{headers:[' + JSON_HEADER() + ']}');
/**
 * Return JSON
 */
export const json: HandlerResponse = isHydrating
  ? noOp
  : (res, hasContext) =>
      hasContext
        ? constants.HEADERS +
          '.push(' +
          JSON_HEADER() +
          ');return new Response(JSON.stringify(' +
          res +
          '),' +
          constants.CTX +
          ')'
        : 'return new Response(JSON.stringify(' +
          res +
          '),' +
          JSON_OPTIONS() +
          ')';

const HTML_HEADER = isHydrating ? noOp : lazyDependency(injectDependency, '["content-type","application/json"]');
const HTML_OPTIONS = isHydrating ? noOp : lazyDependency(injectDependency, '{headers:[' + JSON_HEADER() + ']}');
/**
 * Return HTML
 */
export const html: HandlerResponse<BodyInit> = isHydrating
  ? noOp
  : (res, hasContext) =>
      hasContext
        ? constants.HEADERS +
          '.push(' +
          HTML_HEADER() +
          ');return new Response(' +
          res +
          ',' +
          constants.CTX +
          ')'
        : 'return new Response(' +
          res +
          ',' +
          HTML_OPTIONS() +
          ')';

/**
 * Return a body init
 */
export const text: HandlerResponse<BodyInit> = isHydrating
  ? noOp
  : (res, hasContext) =>
      'return new Response(' +
      res +
      (hasContext ? ',' + constants.CTX + ')' : ')');

/**
 * Handle errors of a router
 * @param f
 */
export const error = <
  const E extends Err,
  const D extends HandlerData | undefined = undefined,
>(
  r: RouterTag<E>,
  f: NoInfer<(err: E, c: Context) => InferReturn<D>>,
  dat?: D,
): RouterTag<never> => {
  // @ts-ignore
  r[2] = [f, dat];
  return r as any;
};

/**
 * Handle requests to a path with a specific method
 * @param method
 * @param path
 * @param handler
 * @param dat
 */
export const route = <
  P extends string,
  const D extends HandlerData | undefined = undefined,
  C = {},
>(
  method: RequestMethod,
  path: P,
  handler: NoInfer<InferHandler<P, D, C>>,
  dat?: D,
): HandlerTag<C> => [method, path, handler, dat] as any;

// @ts-ignore
export const any: DefineHandler = (path, handler, dat) =>
  ['', path, handler, dat] as any;
// @ts-ignore
export const get: DefineHandler = (path, handler, dat) =>
  ['GET', path, handler, dat] as any;
// @ts-ignore
export const post: DefineHandler = (path, handler, dat) =>
  ['POST', path, handler, dat] as any;
// @ts-ignore
export const put: DefineHandler = (path, handler, dat) =>
  ['PUT', path, handler, dat] as any;
// @ts-ignore
export const del: DefineHandler = (path, handler, dat) =>
  ['DELETE', path, handler, dat] as any;
// @ts-ignore
export const patch: DefineHandler = (path, handler, dat) =>
  ['PATCH', path, handler, dat] as any;
// @ts-ignore
export const options: DefineHandler = (path, handler, dat) =>
  ['OPTIONS', path, handler, dat] as any;
// @ts-ignore
export const trace: DefineHandler = (path, handler, dat) =>
  ['TRACE', path, handler, dat] as any;

import type { Identifier } from 'runtime-compiler';
import type { RouteLayer } from './layer.ts';
import { buildRouteCall } from './compilers/call.ts';
import { isHydrating } from 'runtime-compiler/config';

/**
 * Describe a header pair
 */
export type ResponseHeader = [string, string] | readonly [string, string];

/**
 * Response state
 */
export interface ResponseState {
  status: number;
  headers: ResponseHeader[];
}

export interface SendLayer<Params extends any[]> extends RouteLayer<Params> {
  1: (...args: any[]) => any;
  2: Identifier<any>[];
}

const loadRaw: SendLayer<any>[0] = isHydrating
  ? buildRouteCall
  : (self, scope, params, paramsCount) =>
      'return new Response(' +
      buildRouteCall(self, scope, params, paramsCount) +
      ((scope[0] & 2) === 2 ? ',' + constants.CTX + ')' : ')');
/**
 * @example
 * router.get('/', send.raw(() => 'Hi'))
 */
export const raw = <
  const Args extends Identifier<any>[],
  Params extends any[] = [],
>(
  fn: (
    ...args: [
      ...{
        [K in keyof Args]: Args[K]['~type'];
      },
      ...Params,
      res: ResponseState,
    ]
  ) => BodyInit | Promise<BodyInit>,
  ...args: Args
): SendLayer<Params> => [loadRaw, fn, args];

const loadJSON: SendLayer<any>[0] = isHydrating
  ? buildRouteCall
  : (self, scope, params, paramsCount) =>
      'return Response.json(' +
      buildRouteCall(self, scope, params, paramsCount) +
      ((scope[0] & 2) === 2 ? ',' + constants.CTX + ')' : ')');
/**
 * @example
 * router.post('/', send.json(() => ({ hello: 'world' })))
 */
export const json = <
  const Args extends Identifier<any>[],
  Params extends any[] = [],
>(
  fn: (
    ...args: [
      ...{
        [K in keyof Args]: Args[K]['~type'];
      },
      ...Params,
      res: ResponseState,
    ]
  ) => any,
  ...args: Args
): SendLayer<Params> => [loadJSON, fn, args];

const loadHTML: SendLayer<any>[0] = isHydrating
  ? buildRouteCall
  : (self, scope, params, paramsCount) => {
      const call = buildRouteCall(self, scope, params, paramsCount);
      return (scope[0] & 2) === 2
        ? constants.HEADERS +
            '.push(' +
            constants.HTML_HEADER +
            ');return new Response(' +
            call +
            ',' +
            constants.CTX +
            ')'
        : 'return new Response(' + call + ',' + constants.HTML_OPTION + ')';
    };
/**
 * @example
 * router.get('/', send.html(() => '<p>Hi</p>'))
 */
export const html = <
  const Args extends Identifier<any>[],
  Params extends any[] = [],
>(
  fn: (
    ...args: [
      ...{
        [K in keyof Args]: Args[K]['~type'];
      },
      ...Params,
      res: ResponseState,
    ]
  ) => BodyInit | Promise<BodyInit>,
  ...args: Args
): SendLayer<Params> => [loadHTML, fn, args];

import type { Identifier } from 'runtime-compiler';
import type { RouteLayer } from './layer.ts';
import { isHydrating } from 'runtime-compiler/config';
import { buildCall } from './compilers/call.ts';

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

export interface ResponseLayer<Params extends any[]>
  extends RouteLayer<Params> {
  1: (...args: any[]) => any;
  2: Identifier<any>[];
}

const buildRouteCall: ResponseLayer<any>[0] = isHydrating
  ? (self, scope, _, paramsCount) =>
      buildCall(scope, self[1], '', self[2].length + paramsCount)
  : (self, scope, params, paramsCount) => {
      const args = self[2];
      return args.length > 0
        ? paramsCount > 0
          ? buildCall(
              scope,
              self[1],
              args.join() + ',' + params,
              args.length + paramsCount,
            )
          : buildCall(scope, self[1], args.join(), args.length)
        : paramsCount > 0
          ? buildCall(scope, self[1], params, paramsCount)
          : buildCall(scope, self[1], '', 0);
    };

const loadRaw: ResponseLayer<any>[0] = isHydrating
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
): ResponseLayer<Params> => [loadRaw, fn, args];

const loadJSON: ResponseLayer<any>[0] = isHydrating
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
): ResponseLayer<Params> => [loadJSON, fn, args];

const loadHTML: ResponseLayer<any>[0] = isHydrating
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
): ResponseLayer<Params> => [loadHTML, fn, args];

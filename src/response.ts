import type { Identifier } from 'runtime-compiler';
import type { RouteLayer } from './layer.ts';
import { isHydrating } from 'runtime-compiler/config';
import { buildCall, hydrateCall } from './compilers/call.ts';
import type { HandlerScope } from './compilers/scope.ts';

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

const hydrateRouteCall = (
  self: ResponseLayer<any>,
  scope: HandlerScope,
  _: any,
  paramsCount: number,
) => {
  hydrateCall(scope, self[1], self[2].length + paramsCount);
};

const buildRouteCall = (
  self: ResponseLayer<any>,
  scope: HandlerScope,
  params: string,
  paramsCount: number,
): string => {
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
  ? hydrateRouteCall
  : (self, scope, params, paramsCount) => {
      scope[0] +=
        'return new Response(' +
        buildRouteCall(self, scope, params, paramsCount) +
        ((scope[2] & 2) === 2 ? ',' + constants.CTX + ')' : ')');
    };
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
  ? hydrateRouteCall
  : (self, scope, params, paramsCount) => {
      scope[0] +=
        'return Response.json(' +
        buildRouteCall(self, scope, params, paramsCount) +
        ((scope[2] & 2) === 2 ? ',' + constants.CTX + ')' : ')');
    };
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
  ? hydrateRouteCall
  : (self, scope, params, paramsCount) => {
      const call = buildRouteCall(self, scope, params, paramsCount);
      scope[0] +=
        (scope[2] & 2) === 2
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

const loadWithoutContent: RouteLayer<any>[0] = isHydrating
  ? (_, _1) => {}
  : (_, scope) => {
      scope[0] +=
        (scope[2] & 2) === 2
          ? `return new Response(null,${constants.CTX})`
          : `return ${constants.RES_200}`;
    };
/**
 * Return a response without content.
 */
export const withoutContent: RouteLayer<any> = [loadWithoutContent];

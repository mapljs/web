import type { Identifier } from 'runtime-compiler';
import { injectValue, type InferDependencies } from './compiler/utils.ts';
import type { Route } from './router.ts';
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
  statusText: string;
}

export const PARAMS_MAP: string[] = ['', `${constants.PARAMS}0,`];
for (let i = 1; i <= 16; i++) PARAMS_MAP.push(`${PARAMS_MAP[i]}${constants.PARAMS}${i},`);

export const _call = (route: Route, f: (...args: any[]) => any, deps: Identifier<any>[]): string => injectValue(f, route) + '(' + deps.join() + ',' + PARAMS_MAP[route[5]] + (
  f.length > deps.length + route[5]
    ? constants.CTX + ');'
    : ');'
);

export const _hydrateCall: (route: Route, f: (...args: any[]) => any, ...args: any[]) => void = (route, f): void => {
  injectValue(f, route);
}

export const _setResponse = (route: Route, f: (...args: any[]) => any, deps: Identifier<any>[]): void => {
  route[0] += `let ${constants.RES}=` + _call(route, f, deps);
}

export const _setAwaitedResponse = (route: Route, f: (...args: any[]) => any, deps: Identifier<any>[]): void => {
  route[0] += `let ${constants.RES}=await ` + _call(route, f, deps);
  route[3] |= 1;
}

export const _returnRaw = (route: Route): void => {
  route[2] += `return new Response(${constants.RES},${constants.CTX})`;
}

export const _returnHTML = (route: Route): void => {
  route[2] += `${constants.HEADERS}.push(${constants.HTML_HEADER});return new Response(${constants.RES},${constants.CTX})`;
}

export const _returnJSON = (route: Route): void => {
  route[2] += `return Response.json(${constants.RES},${constants.CTX})`;
}

/**
 * @example
 * ```ts
 * const route = router.get(root, '/');
 * send.body(route, (c) => {
 *   c.status = 418;
 *   return 'I\'m a teapot';
 * });
 * ```
 */
export const body: <Params extends any[], const Deps extends Identifier<any>[]>(
  route: Route<Params>,
  f: (...args: [...InferDependencies<Deps>, ...Params, res: ResponseState]) => BodyInit,
  ...args: Deps
) => void = isHydrating ? _hydrateCall : (route, f, ...deps) => {
  _setResponse(route, f, deps);
  _returnRaw(route);
};

/**
 * @example
 * ```ts
 * const route = router.post(root, '/');
 * send.bodyAsync(route, (req) => req.text(), vars.request);
 * ```
 */
export const bodyAsync: <Params extends any[], const Deps extends Identifier<any>[]>(
  route: Route<Params>,
  f: (...args: [...InferDependencies<Deps>, ...Params, res: ResponseState]) => BodyInit | Promise<BodyInit>,
  ...args: Deps
) => void = isHydrating ? _hydrateCall : (route, f, ...deps) => {
  _setAwaitedResponse(route, f, deps);
  _returnRaw(route);
};

/**
 * @example
 * ```ts
 * const route = router.get(root, '/json');
 * send.json(route, (c) => {
 *   c.status = 418;
 *   return { msg: 'I\'m a teapot' };
 * });
 * ```
 */
export const json: <Params extends any[], const Deps extends Identifier<any>[]>(
  route: Route<Params>,
  f: (...args: [...InferDependencies<Deps>, ...Params, res: ResponseState]) => any,
  ...args: Deps
) => void = isHydrating ? _hydrateCall : (route, f, ...deps) => {
  _setResponse(route, f, deps);
  _returnJSON(route);
};

/**
 * @example
 * ```ts
 * const route = router.post(root, '/json');
 * send.jsonAsync(route, (req) => req.json(), vars.request);
 * ```
 */
export const jsonAsync: <Params extends any[], const Deps extends Identifier<any>[]>(
  route: Route<Params>,
  f: (...args: [...InferDependencies<Deps>, ...Params, res: ResponseState]) => Promise<any>,
  ...args: Deps
) => void = isHydrating ? _hydrateCall : (route, f, ...deps) => {
  _setAwaitedResponse(route, f, deps);
  _returnJSON(route);
};

/**
 * @example
 * ```ts
 * const route = router.get(root, '/home');
 * send.html(route, (req) => `<a>${req.url}</a>`, vars.request);
 * ```
 */
export const html: <Params extends any[], const Deps extends Identifier<any>[]>(
  route: Route<Params>,
  f: (...args: [...InferDependencies<Deps>, ...Params, res: ResponseState]) => BodyInit,
  ...args: Deps
) => void = isHydrating ? _hydrateCall : (route, f, ...deps) => {
  _setResponse(route, f, deps);
  _returnHTML(route);
};

/**
 * @example
 * ```ts
 * const route = router.get(root, '/home');
 * send.htmlAsync(route, async (req) => `<p>${await req.text()}</p>`, vars.request);
 * ```
 */
export const htmlAsync: <Params extends any[], const Deps extends Identifier<any>[]>(
  route: Route<Params>,
  f: (...args: [...InferDependencies<Deps>, ...Params, res: ResponseState]) => Promise<BodyInit>,
  ...args: Deps
) => void = isHydrating ? _hydrateCall : (route, f, ...deps) => {
  _setAwaitedResponse(route, f, deps);
  _returnHTML(route);
};

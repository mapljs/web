import type { AnyLayer, AnyRouteLayer } from './layer.ts';
import { argsToArray } from './utils.ts';

/**
 * @example
 * ['GET', '/', ...]
 */
export type Route = [
  method: string,
  path: string,
  ...layers: AnyRouteLayer<any>[],
];

/**
 * Child router data
 */
export type ChildRouter = [subpath: string, Router];

/**
 * Router data
 */
export type Router = [layers: AnyLayer[], routes: Route[], ...ChildRouter[]];

/**
 * Infer param args from path
 */
export type InferParams<Path extends string> =
  Path extends `${string}*${infer Rest}`
    ? Rest extends '*'
      ? [string]
      : [string, ...InferParams<Rest>]
    : [];

// Handle a specific method
export type HandleMethod = <Path extends string>(
  path: Path,
  ...layers: AnyRouteLayer<InferParams<Path>>[]
) => Route;

/**
 * Create a router
 */
export const init: (...args: Router) => Router = argsToArray;

/**
 * Handle custom request method.
 */
export const handle: <Method extends string, Path extends string>(
  method: Uppercase<Method>,
  path: Path,
  ...layers: AnyRouteLayer<InferParams<Path>>[]
) => Route = argsToArray;

/**
 * Mount a child router.
 */
export const mount: (...args: ChildRouter) => ChildRouter = argsToArray;

/**
 * Requests a representation of the specified resource. Requests using GET should only retrieve data and should not contain a request content.
 */
export const get: HandleMethod = (...args) => (
  args.unshift('GET' as any), args as any
);

/**
 * Asks for a response identical to a GET request, but without a response body.
 */
export const head: HandleMethod = (...args) => (
  args.unshift('HEAD' as any), args as any
);

/**
 * Submits an entity to the specified resource, often causing a change in state or side effects on the server.
 */
export const post: HandleMethod = (...args) => (
  args.unshift('POST' as any), args as any
);

/**
 * Replaces all current representations of the target resource with the request content.
 */
export const put: HandleMethod = (...args) => (
  args.unshift('PUT' as any), args as any
);

/**
 * Deletes the specified resource.
 */
export const del: HandleMethod = (...args) => (
  args.unshift('DELETE' as any), args as any
);

/**
 * Establishes a tunnel to the server identified by the target resource.
 */
export const connect: HandleMethod = (...args) => (
  args.unshift('CONNECT' as any), args as any
);

/**
 * Describes the communication options for the target resource.
 */
export const options: HandleMethod = (...args) => (
  args.unshift('OPTIONS' as any), args as any
);

/**
 * Performs a message loop-back test along the path to the target resource.
 */
export const trace: HandleMethod = (...args) => (
  args.unshift('TRACE' as any), args as any
);

/**
 * Applies partial modifications to a resource.
 */
export const patch: HandleMethod = (...args) => (
  args.unshift('PATCH' as any), args as any
);

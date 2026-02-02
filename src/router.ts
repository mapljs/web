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
export const handle: <Path extends string>(
  method: string,
  path: Path,
  ...layers: AnyRouteLayer<InferParams<Path>>[]
) => Route = argsToArray;
export const mount: (...args: ChildRouter) => ChildRouter = argsToArray;

const GET = ['GET'];
export const get: HandleMethod = (...args) => GET.concat(args as any) as any;

const POST = ['POST'];
export const post: HandleMethod = (...args) => POST.concat(args as any) as any;

const PUT = ['PUT'];
export const put: HandleMethod = (...args) => PUT.concat(args as any) as any;

const DELETE = ['DELETE'];
export const del: HandleMethod = (...args) => DELETE.concat(args as any) as any;

const PATCH = ['PATCH'];
export const patch: HandleMethod = (...args) =>
  PATCH.concat(args as any) as any;

const OPTIONS = ['OPTIONS'];
export const options: HandleMethod = (...args) =>
  OPTIONS.concat(args as any) as any;

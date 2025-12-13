import type {
  RegisterRouteFn,
  RegisterRouteWithMethodFn,
  Router,
} from '../compiler/router.ts';

const GET = ['GET'] as const;
export const get: RegisterRouteFn = (...args: any) => GET.concat(args) as any;

const POST = ['POST'] as const;
export const post: RegisterRouteFn = (...args: any) => POST.concat(args) as any;

const PUT = ['PUT'] as const;
export const put: RegisterRouteFn = (...args: any) => PUT.concat(args) as any;

const DEL = ['DELETE'] as const;
export const del: RegisterRouteFn = (...args: any) => DEL.concat(args) as any;

const PATCH = ['PATCH'] as const;
export const patch: RegisterRouteFn = (...args: any) =>
  PATCH.concat(args) as any;

const OPTIONS = ['OPTIONS'] as const;
export const options: RegisterRouteFn = (...args: any) =>
  OPTIONS.concat(args) as any;

const TRACE = ['TRACE'] as const;
export const trace: RegisterRouteFn = (...args: any) =>
  TRACE.concat(args) as any;

const QUERY = ['QUERY'] as const;
export const query: RegisterRouteFn = (...args: any) =>
  QUERY.concat(args) as any;

const ANY = [''] as const;
export const any: RegisterRouteFn = (...args: any) => ANY.concat(args) as any;

export const def: RegisterRouteWithMethodFn = (...args: any) => args;

export const init = (
  layers: Router[0],
  routes: Router[1],
  children?: Router[2],
): Router => (children == null ? [layers, routes] : [layers, routes, children]);

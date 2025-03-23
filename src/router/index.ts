import type { Err, InferErr, InferResult } from 'safe-throw';
import { transformRoute, type InferRoute } from '@mapl/router/transform';

import { proto } from './utils';
import type { ErrorFunc, HandlerData, HandlerFunc, HandlerGroup, MiddlewareFunc } from './handler';
import { ALL, METHODS, type Methods } from './method';

export type RouteRegister<
  in out Args extends any[],
  in out State extends {},
  in out E extends Err
> =
// eslint-disable-next-line
  {
    [K in Methods | 'any']: <Path extends string>(
      path: Path,
      handler: HandlerFunc<InferRoute<Path>, State, Args>,
      ...data: HandlerData[]
    ) => Router<Args, State, E>
  };

export interface Router<
  in out Args extends any[],
  in out State extends {} = {},
  in out E extends Err = never
> extends RouteRegister<Args, State, E> {
  // Types
  _state: State;
  _err: E;

  group: HandlerGroup;

  apply: (fn: MiddlewareFunc<State, Args>) => this;
  check: <const T extends MiddlewareFunc<State, Args>>(fn: T) => Router<
    Args, State, E | InferErr<ReturnType<T>>
  >;

  set: <Prop extends string, const T extends MiddlewareFunc<State, Args>>(prop: Prop, fn: T) => Router<
    Args, State & Record<Prop, ReturnType<T>>, E
  >;
  parse: <Prop extends string, const T extends MiddlewareFunc<State, Args>>(prop: Prop, fn: T) => Router<
    Args, State & Record<Prop, InferResult<ReturnType<T>>>, E | InferErr<ReturnType<T>>
  >;

  route: <Prefix extends string, const App extends Router<Args, any, any>>(prefix: Prefix, app: App) => this;
  err: (fn: ErrorFunc<E, State, Args>, ...data: HandlerData[]) => this;
}

export type AnyRouter = Router<any, any, any> | Router<any, any>;

const createMethodRegister = (method: any) => function (this: AnyRouter, path: string, handler: HandlerFunc, ...data: any[]) {
  this.group[1].push([method, transformRoute(path), handler, proto(...data)]);
  return this as any;
};

const routerProto = proto(
  {
    group: null as any as HandlerGroup,

    apply(f: MiddlewareFunc) {
      this.group[0].push([0, f]);
      return this;
    },
    check(f: MiddlewareFunc) {
      this.group[0].push([1, f]);
      return this;
    },
    set(prop: string, f: MiddlewareFunc) {
      this.group[0].push([2, f, prop]);
      return this;
    },
    parse(prop: string, f: MiddlewareFunc) {
      this.group[0].push([3, f, prop]);
      return this;
    },

    route(prefix: string, app: { group: HandlerGroup }) {
      this.group[3].push([prefix, app.group]);
      return this;
    },

    any: createMethodRegister(ALL),

    err(f: ErrorFunc, ...data: any[]) {
      this.group[2] = [f, proto(...data)];
      return this;
    }
  },

  Object.fromEntries(METHODS.map((method) => [
    method,
    createMethodRegister(method.toUpperCase())
  ]))
);

export default (): Router<[]> => {
  const obj: Router<[]> = Object.create(routerProto);
  obj.group = [[], [], null, []];
  return obj;
};

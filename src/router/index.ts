import type { Err, InferErr, InferResult } from 'safe-throw';
import type { InferRoute } from '@mapl/router/transform';

import { proto, type AwaitedReturn } from './utils';
import type { ErrorFunc, HandlerData, HandlerFunc, HandlerGroup, MiddlewareFunc } from './handler';
import { ALL, METHODS, type Methods } from './method';

export type RouteRegister<
  in out State extends {},
  in out E extends Err
> =
// eslint-disable-next-line
  {
    [K in Methods | 'any']: <Path extends string>(
      path: Path,
      handler: HandlerFunc<InferRoute<Path>, State>,
      ...data: HandlerData[]
    ) => Router<State, E>
  };

export interface Router<
  in out State extends {} = {},
  in out E extends Err = never
> extends RouteRegister<State, E> {
  // Types
  _state: State;
  _err: E;

  _: HandlerGroup;

  apply: (fn: MiddlewareFunc<State>) => this;
  check: <const T extends MiddlewareFunc<State>>(fn: T) => Router<
    State, E | InferErr<AwaitedReturn<T>>
  >;

  set: <Prop extends string, const T extends MiddlewareFunc<State>>(prop: Prop, fn: T) => Router<
    State & Record<Prop, AwaitedReturn<T>>, E
  >;
  parse: <Prop extends string, const T extends MiddlewareFunc<State>>(prop: Prop, fn: T) => Router<
    State & Record<Prop, InferResult<AwaitedReturn<T>>>, E | InferErr<AwaitedReturn<T>>
  >;

  route: <Prefix extends string, const App extends Router<any, any>>(prefix: Prefix, app: App) => this;
  err: (fn: ErrorFunc<E, State>, ...data: HandlerData[]) => this;
}

export type AnyRouter = Router<any, any>;

const createMethodRegister = (method: any) => function (this: AnyRouter, path: string, handler: HandlerFunc, ...data: any[]) {
  this._[1].push([method, path, handler, proto(...data)]);
  return this as any;
};

const routerProto = proto(
  {
    _: null as any as HandlerGroup,

    apply(f: MiddlewareFunc) {
      this._[0].push([0, f as any]);
      return this;
    },
    check(f: MiddlewareFunc) {
      this._[0].push([2, f as any]);
      return this;
    },
    set(prop: string, f: MiddlewareFunc) {
      this._[0].push([1, f as any, prop]);
      return this;
    },
    parse(prop: string, f: MiddlewareFunc) {
      this._[0].push([3, f as any, prop]);
      return this;
    },

    route(prefix: string, app: AnyRouter) {
      this._[3].push([prefix, app._]);
      return this;
    },

    any: createMethodRegister(ALL),

    err(f: ErrorFunc, ...data: any[]) {
      this._[2] = [f, proto(...data)];
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
  obj._ = [[], [], null, []];
  return obj;
};

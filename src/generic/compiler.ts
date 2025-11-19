import {
  createRouter,
  insertItem,
  type Router as MethodRouter,
} from '@mapl/router/method';
import compileMethodRouter from '@mapl/router/method/compiler';

import {
  addExtraCode,
  evaluate,
  hydrate as finishHydration,
  injectDependency,
  type LocalDependency,
} from 'runtime-compiler';

import {
  build as buildRouter,
  hydrate as hydrateRouter,
  setRegisterRoute,
  type registerRoute,
  type Router,
} from '../compiler/router.ts';
import { finalizeReturn } from '../compiler/state.ts';

export type BuiltFn = () => (req: Request) => any;

let methodRouter: MethodRouter<string>;

export const registerRouteCb: typeof registerRoute = (
  route,
  state,
  prefix,
  content,
) => {
  insertItem(
    methodRouter,
    route[0],
    prefix + route[1],
    finalizeReturn(state, content, `(${constants.REQ})`),
  );
};

export const buildToString = (router: Router): string => {
  methodRouter = createRouter();
  setRegisterRoute(registerRouteCb);

  buildRouter(router, [false, false] as any, '', '');

  return `()=>{${constants.DECL_GLOBALS}return(${constants.REQ})=>{${compileMethodRouter(
    methodRouter,
    `${constants.REQ}.method`,
    `let ${constants.FULL_URL}=${constants.REQ}.url,${constants.PATH_START}=${constants.FULL_URL}.indexOf('/',10)+1,${constants.PATH_END}=${constants.FULL_URL}.indexOf('?',${constants.PATH_START}),${constants.PATH}=${constants.PATH_END}===-1?${constants.FULL_URL}.slice(${constants.PATH_START}):${constants.FULL_URL}.slice(${constants.PATH_START},${constants.PATH_END});`,
    1,
  )}return ${constants.RES_404}}}`;
};

export const buildToDependency = (router: Router): LocalDependency<BuiltFn> =>
  injectDependency(buildToString(router));

/**
 * Build the router synchronously
 */
export const build = (router: Router): BuiltFn => (
  addExtraCode('return' + buildToString(router)), evaluate()
);

/**
 * Return the arguments needed in `hydrate` mode.
 */
export const hydrate = (router: Router): any[] => (
  hydrateRouter(router, [false, false] as any), finishHydration()
);

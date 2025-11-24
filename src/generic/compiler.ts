import {
  createRouter,
  insertItem,
  type Router as MethodRouter,
} from '@mapl/router/method';
import compileMethodRouter from '@mapl/router/method/compiler';

import {
  addExtraCode,
  evaluate,
  evaluateToString,
  hydrate as finishHydration,
  injectDependency,
  type LocalDependency,
} from 'runtime-compiler';

import {
  build as buildRouter,
  hydrate as hydrateRouter,
  type Router,
} from '../compiler/router.ts';
import { finalizeReturn } from '../compiler/state.ts';
import {
  setHandlerArgs,
  setRegisterRoute,
  setRouteParamMap,
  type registerRoute,
} from '../compiler/globals.ts';

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
    finalizeReturn(state, content),
  );
};

const buildWrapper = (router: Router): string => {
  setHandlerArgs(`(${constants.REQ})`);

  // Init router
  methodRouter = createRouter();
  setRegisterRoute(registerRouteCb);

  // Init param map
  const paramMap = ['', `${constants.PARAMS}0,`];
  for (let i = 1; i <= 8; i++)
    paramMap.push(`${paramMap[i]}${constants.PARAMS}${i},`);
  setRouteParamMap(paramMap);

  // Run build
  buildRouter(router, [false, false] as any, '', '');

  return `()=>{${constants.DECL_GLOBALS}return(${constants.REQ})=>{${compileMethodRouter(
    methodRouter,
    `${constants.REQ}.method`,
    `let ${constants.FULL_URL}=${constants.REQ}.url,${constants.PATH_START}=${constants.FULL_URL}.indexOf('/',10)+1,${constants.PATH_END}=${constants.FULL_URL}.indexOf('?',${constants.PATH_START}),${constants.PATH}=${constants.PATH_END}===-1?${constants.FULL_URL}.slice(${constants.PATH_START}):${constants.FULL_URL}.slice(${constants.PATH_START},${constants.PATH_END});`,
    1,
  )}return ${constants.RES_404}}}`;
};

/**
 * Build to a local dependency.
 * Use in `default` and `build` mode.
 */
export const buildToDependency = (router: Router): LocalDependency<BuiltFn> =>
  injectDependency(buildWrapper(router));

/**
 * Hydrate to a local dependency.
 * Use in `hydrate` mode.
 */
export const hydrateToDependency = (router: Router): void => {
  hydrateRouter(router, [false, false] as any);
};

/**
 * Build the router into evaluatable string.
 * Use in `build` mode.
 *
 * @example
 * `(${buildToString(app)})(hydrate(app));`
 */
export const buildToString = (router: Router): string => (
  addExtraCode('return' + buildWrapper(router)), evaluateToString()
);

/**
 * Build the router to a lazy function.
 * Use in `default` mode.
 */
export const build = (router: Router): BuiltFn => (
  addExtraCode('return' + buildWrapper(router)), evaluate()
);

/**
 * Return the arguments needed in `hydrate` mode.
 */
export const hydrate = (router: Router): any[] => (
  hydrateToDependency(router), finishHydration()
);

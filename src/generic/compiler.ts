import {
  createRouter,
  insertItem,
  type Router as MethodRouter,
} from '@mapl/router/method';
import compileMethodRouter from '@mapl/router/method/compiler';

import {
  evaluateSync,
  exportDependency,
  finishHydration,
  getDependency,
  injectDependency,
  markExported,
  type LocalDependency,
} from 'runtime-compiler';

import {
  build,
  hydrate,
  setRegisterRoute,
  type registerRoute,
  type Router,
} from '../compiler/router.ts';
import { finalizeReturn } from '../compiler/state.ts';

export let methodRouter: MethodRouter<string>;

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

  build(router, [false, false] as any, '', '');

  return `()=>{${constants.DECL_GLOBALS}return(${constants.REQ})=>{${compileMethodRouter(
    methodRouter,
    `${constants.REQ}.method`,
    `let ${constants.FULL_URL}=${constants.REQ}.url,${constants.PATH_START}=${constants.FULL_URL}.indexOf('/',10)+1,${constants.PATH_END}=${constants.FULL_URL}.indexOf('?',${constants.PATH_START}),${constants.PATH}=${constants.PATH_END}===-1?${constants.FULL_URL}.slice(${constants.PATH_START}):${constants.FULL_URL}.slice(${constants.PATH_START},${constants.PATH_END});`,
    1,
  )}return${constants.RES_404}}}`;
};

export const buildToDependency = (
  router: Router,
): LocalDependency<() => (req: Request) => any> =>
  injectDependency(buildToString(router));

export const buildSync = (router: Router): (() => (req: Request) => any) => {
  const id = exportDependency(buildToDependency(router));
  evaluateSync();
  return getDependency(id);
};

export const hydrateSync = (router: Router): (() => (req: Request) => any) => {
  hydrate(router, [false, false] as any);
  const id = markExported<() => (req: Request) => any>();
  finishHydration();
  return getDependency(id);
};

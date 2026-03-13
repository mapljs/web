import type { BaseScope } from '../router.ts';

export type Router = Map<string, [optimizable: boolean, methods: string[], routes: BaseScope[]]>;

export const _isMethodOptimizable = (method: string): boolean =>
  method === 'GET' ||
  method === 'POST' ||
  method === 'PUT' ||
  method === 'DELETE' ||
  method === 'PATCH' ||
  method === 'HEAD' ||
  method === 'OPTIONS';

export const createRouter = (): Router => new Map();

export const insertItem = (router: Router, method: string, path: string, item: BaseScope): void => {
  const cur = router.get(path);
  if (cur == null) router.set(path, [_isMethodOptimizable(method), [method], [item]]);
  else {
    cur[0] &&= _isMethodOptimizable(method);

    const id = cur[1].indexOf(method);
    if (id === -1) {
      cur[1].push(method);
      cur[2].push(item);
    } else cur[2][id] = item;
  }
};

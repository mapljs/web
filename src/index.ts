import type { Router } from './compiler/router.ts';

export * as send from './generic/handlers.ts';
export * as route from './generic/route.ts';
export * as layer from './generic/layers.ts';

export { inject } from 'runtime-compiler/call';

export const router = (
  layers: Router[0],
  routes: Router[1],
  children?: Router[2],
): Router => (children == null ? [layers, routes] : [layers, routes, children]);

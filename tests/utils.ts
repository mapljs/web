import { compileToHandlerSync as bunc } from '@mapl/web/bun/compiler/jit';
import { compileToHandlerSync as genericc } from '@mapl/web/compiler/jit';
import type { RouterTag } from '@mapl/web/core';
import type { Serve } from 'bun';

export const serve = (
  options: Serve.Options<any, any> & { port: number },
): typeof fetch => {
  Bun.serve(options);
  const PREFIX = `http://127.0.0.1:${options.port}`;
  return ((url: string, options?: RequestInit) =>
    fetch(PREFIX + url, options)) as any;
};

export const serveBun = (port: number, app: RouterTag<any, any>) =>
  serve({
    port,
    routes: bunc(app),
  });

export const serveGeneric = (port: number, app: RouterTag<any, any>) =>
  serve({
    port,
    fetch: genericc(app),
  });

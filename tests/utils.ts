import type { Serve } from 'bun';

export const serve = (
  options: Serve.Options<any, any> & { port: number; hostname: string },
) => {
  Bun.serve(options);
  return `http://${options.hostname}:${options.port}`;
};

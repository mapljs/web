import { writeFileSync } from 'node:fs';
import { build, type BuildOptions, type OutputOptions } from 'rolldown';

import { compileToExportedDependency as generic } from '../compiler/jit.js';
import { compileToExportedDependency as bun } from '../compiler/bun/jit.js';

import { evaluateToString } from 'runtime-compiler/jit';
import { clear } from 'runtime-compiler';

export interface MaplBuildOptions {
  input: string;
  output: Omit<OutputOptions, 'dir'> & { file: string };
  buildOptions?: Omit<BuildOptions, 'input' | 'output'>;
  finalizeOptions?: Omit<BuildOptions, 'input' | 'output'>;
  asynchronous?: boolean,
  target?: 'bun';
}

export default async (opts: MaplBuildOptions): Promise<void> => {
  const output = opts.output;
  const input = opts.input;

  await build({
    ...opts.buildOptions,
    input,
    output: {
      file: output.file,
    },
  });

  const appMod = await import(output.file);
  const HANDLER = (opts.target === 'bun' ? bun : generic)(appMod.default);

  writeFileSync(
    output.file,
    `
      import 'runtime-compiler/hydrate-loader';

      import app, { serveOptions } from ${JSON.stringify(input)};
      import hydrateRouter from '@mapl/web/compiler/${opts.target === 'bun' ? 'bun/' : ''}aot';
      hydrateRouter(app);

      import { hydrate } from 'runtime-compiler/hydrate';
      import { getDependency } from 'runtime-compiler';

      ${opts.asynchronous ? 'await(async' : '('}${evaluateToString()})(...hydrate());
      ${opts.target === 'bun'
        ? `Bun.serve({
          routes: getDependency(${HANDLER}),
          ...serveOptions
        });`
        : `export default {
          fetch: getDependency(${HANDLER}),
          ...serveOptions
        };`
      }
    `,
  );
  clear();

  await build({
    ...(opts.finalizeOptions ?? opts.buildOptions),
    input: output.file,
    output,
  });
};

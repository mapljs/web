import { writeFileSync } from 'node:fs';
import { build, watch, type BuildOptions, type OutputOptions, type RolldownWatcher, type WatcherOptions } from 'rolldown';

import { compileToExportedDependency as generic } from '../compiler/jit.js';
import { compileToExportedDependency as bun } from '../compiler/bun/jit.js';

import { evaluateToString } from 'runtime-compiler/jit';
import { clear } from 'runtime-compiler';
import { resolve } from 'node:path';

export interface MaplBuildOptions {
  /**
   * App entry point
   */
  input: string;

  /**
   * Output options
   */
  output: Omit<OutputOptions, 'dir'> & { file: string };

  /**
   * App build options
   */
  buildOptions?: Omit<BuildOptions, 'input' | 'output'>;

  /**
   * App output build options
   */
  finalizeOptions?: Omit<BuildOptions, 'input' | 'output'>;

  /**
   * Whether to emit asynchronous output
   */
  asynchronous?: boolean;

  /**
   * Build target
   */
  target?: 'bun';
}

export default async (opts: MaplBuildOptions): Promise<void> => {
  const output = opts.output;
  const input = resolve(opts.input);

  await build({
    ...opts.buildOptions,
    input,
    output: {
      file: output.file,
    },
  });

  const appMod = await import(resolve(output.file));
  const HANDLER = (opts.target === 'bun' ? bun : generic)(appMod.default);

  writeFileSync(
    output.file,
    `
      import 'runtime-compiler/hydrate-loader';

      import * as app from ${JSON.stringify(input)};
      import hydrateRouter from '@mapl/web/compiler/${opts.target === 'bun' ? 'bun/' : ''}aot';
      hydrateRouter(app.default);

      import { hydrate } from 'runtime-compiler/hydrate';
      import { getDependency } from 'runtime-compiler';

      ${opts.asynchronous ? 'await(async' : '('}${evaluateToString()})(...hydrate());
      ${
        opts.target === 'bun'
          ? `Bun.serve({ routes: getDependency(${HANDLER}), ...app.serveOptions });`
          : `export default { fetch: getDependency(${HANDLER}), ...app.serveOptions };`
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

export interface MaplDevOptions extends Omit<MaplBuildOptions, 'finalizeOptions'> {
  watcherOptions?: WatcherOptions
}

export const dev = (opts: MaplDevOptions): RolldownWatcher => {
  const output = opts.output;
  const input = resolve(opts.input);
  const outputFile = resolve(output.file);

  const compileResult = opts.asynchronous
    ? 'await compileToHandler(app.default)'
    : 'compileToHandlerSync(app.default)';

  writeFileSync(
    outputFile,
    `
      import * as app from ${JSON.stringify(input)};
      import { compileToHandler${opts.asynchronous ? '' : 'Sync'} } from '@mapl/web/compiler/${opts.target === 'bun' ? 'bun/' : ''}jit';

      ${opts.target === 'bun'
      ? `Bun.serve({ routes: ${compileResult}, ...app.serveOptions });`
      : `export default { fetch: ${compileResult}, ...app.serveOptions };`
    }
    `,
  );

  // Add output file to exclude
  const watcher = opts.watcherOptions ??= {};
  const exclude = watcher.exclude;
  watcher.exclude = exclude == null
    ? outputFile
    : !Array.isArray(exclude)
      ? [exclude, outputFile]
      : exclude.concat(outputFile);

  return watch({
    ...opts.buildOptions,
    input: outputFile,
    output,
    watch: watcher
  });
};

import { mkdirSync, writeFileSync } from 'node:fs';
import { build, watch, type BuildOptions, type OutputOptions, type RolldownWatcher, type WatcherOptions } from 'rolldown';

import { compileToExportedDependency as generic } from '../compiler/jit.js';
import { compileToExportedDependency as bun } from '../compiler/bun/jit.js';

import { evaluateToString } from 'runtime-compiler/jit';
import { clear } from 'runtime-compiler';
import { join, resolve } from 'node:path';

export interface MaplBuildOptions {
  /**
   * App entry point
   */
  input: string;

  /**
   * Output options
   */
  output: Omit<OutputOptions, 'file'> & { dir: string };

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

export interface MaplDevOptions extends Omit<MaplBuildOptions, 'finalizeOptions'> {
  /**
   * File watcher option
   */
  watcherOptions?: WatcherOptions
}

export interface MaplAllOptions {
  common: MaplDevOptions & MaplBuildOptions;
  dev?: Partial<MaplDevOptions>,
  build?: Partial<MaplBuildOptions>
};

export default async (opts: MaplBuildOptions): Promise<void> => {
  const output = opts.output;
  const outputFile = join(output.dir, 'server-exports.js');
  const tmpFile = resolve(output.dir, 'tmp.js');

  // Bundle input to tmpFile
  await build({
    ...opts.buildOptions,
    input: opts.input,
    output: {
      file: tmpFile,
    },
  });

  // calculate tmpFile JIT content
  const appMod = await import(tmpFile);
  const HANDLER = (opts.target === 'bun' ? bun : generic)(appMod.default);

  // Write JIT content to output
  try {
    mkdirSync(output.dir, { recursive: true });
  } catch {}
  writeFileSync(
    outputFile,
    `
      import 'runtime-compiler/hydrate-loader';

      import * as app from ${JSON.stringify(tmpFile)};
      import hydrateRouter from '@mapl/web/compiler/${opts.target === 'bun' ? 'bun/' : ''}aot';
      hydrateRouter(app.default);

      import { hydrate } from 'runtime-compiler/hydrate';
      import { getDependency } from 'runtime-compiler';

      ${opts.asynchronous ? 'await(async' : '('}${evaluateToString()})(...hydrate());
      ${
        opts.target === 'bun'
          ? `export default { routes: getDependency(${HANDLER}), ...app.serveOptions };`
          : `export default { fetch: getDependency(${HANDLER}), ...app.serveOptions };`
      }
    `,
  );
  clear();

  // Bundle output
  await build({
    ...(opts.finalizeOptions ?? opts.buildOptions),
    input: outputFile,
    output: {
      ...output,
      file: outputFile,
      dir: undefined
    },
  });
};

export const dev = (opts: MaplDevOptions): RolldownWatcher => {
  const output = opts.output;
  const input = resolve(opts.input);
  const tmpFile = join(output.dir, 'tmp.js');

  const compileResult = opts.asynchronous
    ? 'await compileToHandler(app.default)'
    : 'compileToHandlerSync(app.default)';

  // Write JIT code to tmpFile
  try {
    mkdirSync(output.dir, { recursive: true });
  } catch {}
  writeFileSync(
    tmpFile,
    `
      import * as app from ${JSON.stringify(input)};
      import { compileToHandler${opts.asynchronous ? '' : 'Sync'} } from '@mapl/web/compiler/${opts.target === 'bun' ? 'bun/' : ''}jit';

      ${opts.target === 'bun'
      ? `export default { routes: ${compileResult}, ...app.serveOptions };`
      : `export default { fetch: ${compileResult}, ...app.serveOptions };`
    }
    `,
  );

  // Bundle tmpFile to outputFile
  return watch({
    ...opts.buildOptions,
    input: tmpFile,
    output: {
      file: join(output.dir, 'server-exports.js'),
      dir: undefined,
    }
  });
};

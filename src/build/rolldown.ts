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
   * App finalize options
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
  const inputFile = resolve(opts.input);
  const outputFile = join(output.dir, 'server-exports.js');
  const tmpFile = resolve(output.dir, 'tmp.js');

  const external = opts.buildOptions?.external;

  // Bundle input to tmpFile
  await build({
    ...opts.buildOptions,
    input: inputFile,
    output: {
      file: tmpFile,
    },

    // Don't bundle runtime-compiler/config right away
    external: external == null
      ? 'runtime-compiler/config'
      : Array.isArray(external)
        ? external.concat('runtime-compiler/config')
        : typeof external === 'function'
          ? (id, parentId, isResolved) => id === 'runtime-compiler/config' || external(id, parentId, isResolved)
          : [external, 'runtime-compiler/config']
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

      import app from ${JSON.stringify(tmpFile)};
      import hydrateRouter from '@mapl/web/compiler/${opts.target === 'bun' ? 'bun/' : ''}aot';
      hydrateRouter(app);

      import { hydrate } from 'runtime-compiler/hydrate';
      import { getDependency } from 'runtime-compiler';

      ${opts.asynchronous ? 'await(async' : '('}${evaluateToString()})(...hydrate());
      ${
        opts.target === 'bun'
          ? `export default { routes: getDependency(${HANDLER}) };`
          : `export default { fetch: getDependency(${HANDLER}) };`
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
  const tmpFile = resolve(output.dir, 'tmp.js');

  // Watch input
  const watcher = watch({
    ...opts.buildOptions,
    input: resolve(opts.input),
    output: {
      ...output,
      file: tmpFile,
      dir: undefined,
    },
    watch: opts.watcherOptions
  });

  const compileResult = opts.asynchronous
    ? 'await compileToHandler(app)'
    : 'compileToHandlerSync(app)';

  // Write export code to output
  try {
    mkdirSync(output.dir, { recursive: true });
  } catch {}
  writeFileSync(
    join(output.dir, 'server-exports.js'),
    `
      import app from ${JSON.stringify(tmpFile)};
      import { compileToHandler${opts.asynchronous ? '' : 'Sync'} } from '@mapl/web/compiler/${opts.target === 'bun' ? 'bun/' : ''}jit';

      ${opts.target === 'bun'
      ? `export default { routes: ${compileResult} };`
      : `export default { fetch: ${compileResult} };`
    }
    `,
  );

  return watcher;
};

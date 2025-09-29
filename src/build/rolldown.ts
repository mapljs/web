import { mkdirSync, writeFileSync } from 'node:fs';
import {
  build,
  watch,
  type BuildOptions,
  type OutputOptions,
  type RolldownWatcher,
  type RolldownPluginOption,
  type RolldownWatcherEvent
} from 'rolldown';

import { compileToExportedDependency as generic } from '../compiler/jit.js';
import { compileToExportedDependency as bun } from '../compiler/bun/jit.js';

import { evaluateToString } from 'runtime-compiler/jit';
import { resolve } from 'node:path';
import { EXTERNALS } from './utils.js';

export interface MaplBuildOptions
  extends Omit<BuildOptions, 'input' | 'output'> {
  output?: Omit<OutputOptions, 'file' | 'dir'>;
}

export interface MaplOptions {
  /**
   * App entry point
   */
  main: string;

  /**
   * Output directory
   */
  outputDir: string;

  /**
   * Build options
   */
  build?: MaplBuildOptions;

  /**
   * Whether to emit asynchronous output
   */
  asynchronous?: boolean;

  /**
   * Build target
   */
  target?: 'bun';

  /**
   * Hydrate specific options
   */
  hydrate?: MaplBuildOptions;
}

// Plugins to manipulate imports
export const hydrateImportsPlugin: RolldownPluginOption = {
  name: 'mapl-web-hydrate-config-replacer',
  resolveId(source) {
    return this.resolve(
      source === 'runtime-compiler/config'
        ? 'runtime-compiler/hydrate-config'
        : source,
    );
  },
};

export const SERVER_ENTRY = 'index.js';

const mkdirSafe = (dir: string) => {
  try {
    mkdirSync(dir, { recursive: true });
  } catch {}
};

export default async (options: MaplOptions): Promise<void> => {
  const buildOptions = options.build;
  const hydrateOptions = options.hydrate;

  const targetOption = options.target;
  const asyncOption = options.asynchronous;

  const inputFile = resolve(options.main);

  let tmpFile: string;
  if (buildOptions == null) {
    tmpFile = inputFile;
    mkdirSafe(options.outputDir);
  } else {
    tmpFile = resolve(options.outputDir, 'tmp.js');

    const outputOptions = buildOptions?.output;
    // Bundle input to tmpFile
    const currentExternals = buildOptions?.external;
    await build({
      ...buildOptions,
      input: inputFile,
      output: {
        ...outputOptions,
        file: tmpFile,
      },
      external:
        currentExternals == null
          ? EXTERNALS
          : typeof currentExternals === 'function'
            ? (id, ...args) =>
                EXTERNALS.includes(id) || currentExternals(id, ...args)
            : (EXTERNALS as (string | RegExp)[]).concat(currentExternals),
    });
  }

  // calculate outputFile JIT content
  const appMod = await import(tmpFile);
  const HANDLER = (targetOption === 'bun' ? bun : generic)(appMod.default);

  const outputFile = resolve(options.outputDir, SERVER_ENTRY);
  writeFileSync(
    outputFile,
    `
      import app from ${JSON.stringify(tmpFile)};
      import hydrateRouter from '@mapl/web/compiler/${targetOption === 'bun' ? 'bun/' : ''}aot';
      hydrateRouter(app);

      import { hydrate } from 'runtime-compiler/hydrate';
      import { getDependency } from 'runtime-compiler';

      ${asyncOption ? 'await(async' : '('}${evaluateToString()})(...hydrate());
      export default {
        ${targetOption === 'bun' ? 'routes' : 'fetch'}: getDependency(${HANDLER})
      };
    `,
  );

  // Bundle output
  const currentPlugins = hydrateOptions?.plugins;
  await build({
    ...hydrateOptions,
    input: outputFile,
    output: {
      ...hydrateOptions?.output,
      file: outputFile,
    },

    // replace runtime-compiler/config with runtime-compiler/hydrate-config
    plugins: !currentPlugins
      ? hydrateImportsPlugin
      : Array.isArray(currentPlugins)
        ? [hydrateImportsPlugin].concat(currentPlugins as any)
        : [hydrateImportsPlugin, currentPlugins],
  });
};

const jitContent = (inputFile: string, options: MaplOptions) => {
  const asyncOption = options.asynchronous === true;
  const targetOption = options.target;

  return `
    import app from ${JSON.stringify(inputFile)};
    import { ${asyncOption ? 'compileToHandler' : 'compileToHandlerSync'} } from '@mapl/web/compiler/${targetOption === 'bun' ? 'bun/' : ''}jit';

    export default {
      ${targetOption === 'bun' ? 'routes' : 'fetch'}: ${
        asyncOption ? 'await compileToHandler' : 'compileToHandlerSync'
      }(app)
    };
  `;
};

export const watcherReady = (watcher: RolldownWatcher): Promise<void> => new Promise((res, rej) => {
  const listener = (e: RolldownWatcherEvent) => {
    if (e.code === 'ERROR')
      rej(e.error);
    else if (e.code === 'BUNDLE_END')
      res();
    watcher.off('event', listener);
  }
  watcher.on('event', listener);
});

export const dev = (options: MaplOptions): RolldownWatcher | void => {
  const outputFile = resolve(options.outputDir, SERVER_ENTRY);
  mkdirSafe(options.outputDir);
  const content = jitContent(resolve(options.main), options);

  if (options.build != null) {
    const buildOptions = options.build;
    const outputOptions = buildOptions?.output;

    const tmpFile = resolve(options.outputDir, 'tmp.js');

    // Write export code to output
    mkdirSafe(options.outputDir);
    writeFileSync(tmpFile, content);

    return watch({
      ...buildOptions,
      input: tmpFile,
      output: {
        ...outputOptions,
        file: outputFile,
      },
    });
  }

  // Write export code to output
  writeFileSync(outputFile, content);
};

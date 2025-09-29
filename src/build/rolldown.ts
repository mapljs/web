import { mkdirSync, writeFileSync } from 'node:fs';
import {
  build,
  watch,
  type BuildOptions,
  type OutputOptions,
  type RolldownWatcher,
  type RolldownPluginOption,
  type RolldownWatcherEvent,
} from 'rolldown';

import { compileToExportedDependency as generic } from '../compiler/jit.js';
import { compileToExportedDependency as bun } from '../bun/compiler/jit.js';

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
   * Compiler module to use
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

// mkdir if not exists
const mkdirSafe = (dir: string) => {
  try {
    mkdirSync(dir, { recursive: true });
  } catch {}
};

// Get compiler module from target
const getTargetCompilerMod = (targetOption: MaplOptions['target']) => targetOption == null ? '@mapl/web/compiler/' : '@mapl/web/' + targetOption + '/compiler/';

export const hydrate = async (options: MaplOptions): Promise<void> => {
  const buildOptions = options.build;
  const hydrateOptions = options.hydrate;

  const asyncOption = options.asynchronous;

  const inputFile = resolve(options.main);
  const compilerPrefix = getTargetCompilerMod(options.target);

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
  const { compileToExportedDependency } = await import(compilerPrefix + 'jit');
  const HANDLER = compileToExportedDependency(appMod.default);

  const outputFile = resolve(options.outputDir, SERVER_ENTRY);
  writeFileSync(
    outputFile,
    `
      import app from ${JSON.stringify(tmpFile)};
      import hydrateRouter from '${compilerPrefix}aot';
      hydrateRouter(app);

      import { hydrate } from 'runtime-compiler/hydrate';
      import { getDependency } from 'runtime-compiler';

      ${asyncOption ? 'await(async' : '('}${evaluateToString()})(...hydrate());
      export default getDependency(${HANDLER});
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
  return `
    import app from ${JSON.stringify(inputFile)};
    import { ${asyncOption ? 'compileToHandler' : 'compileToHandlerSync'} } from '${getTargetCompilerMod(options.target)}jit';
    export default ${asyncOption ? 'await compileToHandler' : 'compileToHandlerSync'}(app);
  `;
};

export const onceBundled = (watcher: RolldownWatcher): Promise<void> =>
  new Promise((res, rej) =>
    watcher.on('event', function f(e: RolldownWatcherEvent) {
      if (e.code === 'ERROR') rej(e.error);
      else if (e.code === 'BUNDLE_END') res();
      watcher.off('event', f);
    }),
  );

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

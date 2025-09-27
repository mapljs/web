import { mkdirSync, writeFileSync } from 'node:fs';
import {
  build,
  watch,
  type BuildOptions,
  type OutputOptions,
  type RolldownWatcher,
  type RolldownPluginOption,
  type ExternalOption
} from 'rolldown';

import { compileToExportedDependency as generic } from '../compiler/jit.js';
import { compileToExportedDependency as bun } from '../compiler/bun/jit.js';

import { evaluateToString } from 'runtime-compiler/jit';
import { clear } from 'runtime-compiler';
import { resolve } from 'node:path';
import { EXTERNALS } from './utils.js';

export interface MaplOptions {
  /**
   * Build options
   */
  build: Omit<BuildOptions, 'input' | 'output'> & {
    /**
     * App entry point
     */
    input: string;

    /**
     * Output options
     */
    output: Omit<OutputOptions, 'file'> & { dir: string };
  };

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
  hydrate: Omit<BuildOptions, 'input' | 'output'> & {
    output: Omit<OutputOptions, 'file' | 'dir'>;
  };
}

// Plugins to manipulate imports
export const hydrateImportsPlugin: RolldownPluginOption = {
  name: 'mapl-web-hydrate-config-replacer',
  resolveId(source) {
    return source === 'runtime-compiler/config'
      ? this.resolve('runtime-compiler/hydrate-config')
      : null;
  }
}

export const loadExternals = (currentExternals: ExternalOption | undefined): ExternalOption =>
  currentExternals == null
    ? EXTERNALS
    : typeof currentExternals === 'function'
      ? (id, ...args) => EXTERNALS.includes(id) || currentExternals(id, ...args)
      : (EXTERNALS as (string | RegExp)[]).concat(currentExternals)

export default async (options: MaplOptions): Promise<void> => {
  const buildOptions = options.build;
  const hydrateOptions = options.hydrate;

  const targetOption = options.target;
  const asyncOption = options.asynchronous;

  const outputOptions = buildOptions.output;

  const inputFile = resolve(buildOptions.input);
  const outputFile = resolve(outputOptions.dir, 'server-exports.js');
  const tmpFile = resolve(outputOptions.dir, 'tmp.js');

  // Bundle input to tmpFile
  await build({
    ...buildOptions,
    input: inputFile,
    output: {
      ...outputOptions,
      file: tmpFile,
      dir: undefined,
    },
    treeshake: false,
    external: loadExternals(buildOptions.external)
  });

  // calculate outputFile JIT content
  const appMod = await import(tmpFile);
  const HANDLER = (targetOption === 'bun' ? bun : generic)(appMod.default);

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
  clear();

  // Bundle output
  const currentPlugins = hydrateOptions.plugins;
  await build({
    ...hydrateOptions,
    input: outputFile,
    output: {
      ...hydrateOptions.output,
      file: outputFile,
      dir: undefined,
    },

    // replace runtime-compiler/config with runtime-compiler/hydrate-config
    plugins: !currentPlugins
      ? hydrateImportsPlugin
      : Array.isArray(currentPlugins)
        ? [hydrateImportsPlugin].concat(currentPlugins as any)
        : [hydrateImportsPlugin, currentPlugins]
  });
};

export const dev = (options: MaplOptions): RolldownWatcher => {
  const buildOptions = options.build;

  const targetOption = options.target;
  const asyncOption = options.asynchronous;

  const outputOptions = buildOptions.output;

  const inputFile = resolve(buildOptions.input);
  const outputFile = resolve(outputOptions.dir, 'server-exports.js');
  const tmpFile = resolve(outputOptions.dir, 'tmp.js');

  // Write export code to output
  try {
    mkdirSync(outputOptions.dir, { recursive: true });
  } catch {}
  writeFileSync(
    tmpFile,
    `
      import app from ${JSON.stringify(inputFile)};
      import { ${asyncOption ? 'compileToHandler' : 'compileToHandlerSync'} } from '@mapl/web/compiler/${targetOption === 'bun' ? 'bun/' : ''}jit';

      export default {
        ${targetOption === 'bun' ? 'routes' : 'fetch'}: ${
        asyncOption
            ? 'await compileToHandler'
            : 'compileToHandlerSync'
        }(app)
      };
    `,
  );

  return watch({
    input: tmpFile,
    output: {
      ...outputOptions,
      file: outputFile,
      dir: undefined,
    },
    treeshake: false,
    external: loadExternals(buildOptions.external)
  });
};

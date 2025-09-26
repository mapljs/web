import { mkdirSync, writeFileSync } from 'node:fs';
import {
  build,
  watch,
  type BuildOptions,
  type OutputOptions,
  type RolldownWatcher,
} from 'rolldown';

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

export interface MaplDevOptions
  extends Omit<MaplBuildOptions, 'finalizeOptions'> {}

export interface MaplAllOptions {
  common: MaplDevOptions & MaplBuildOptions;
  dev?: Partial<MaplDevOptions>;
  build?: Partial<MaplBuildOptions>;
}

// Packages that can be affected by compiling app first
const EXCLUDE: (string | RegExp)[] = [
  'runtime-compiler',
  '@mapl/framework',
  '@mapl/web',
];

export default async (opts: MaplBuildOptions): Promise<void> => {
  const output = opts.output;

  const inputFile = resolve(opts.input);
  const outputFile = resolve(output.dir, 'server-exports.js');
  const tmpFile = resolve(output.dir, 'tmp.js');

  const external = opts.buildOptions?.external;

  // Bundle input to tmpFile
  await build({
    ...opts.buildOptions,
    input: inputFile,
    output: {
      file: tmpFile,
    },
    treeshake: false,
    external:
      external == null
        ? EXCLUDE
        : typeof external === 'function'
          ? (id, parentId, isResolved) =>
              EXCLUDE.includes(id) || external(id, parentId, isResolved)
          : EXCLUDE.concat(external),
  });

  // calculate outputFile JIT content
  const appMod = await import(tmpFile);
  const HANDLER = (opts.target === 'bun' ? bun : generic)(appMod.default);
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
      export default {
        ${opts.target === 'bun' ? 'routes' : 'fetch'}: getDependency(${HANDLER})
      };
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
      dir: undefined,
    },
  });
};

export const dev = (opts: MaplDevOptions): RolldownWatcher => {
  const output = opts.output;

  const inputFile = resolve(opts.input);
  const tmpFile = resolve(output.dir, 'tmp.js');
  const outputFile = resolve(output.dir, 'server-exports.js');

  // Write export code to output
  try {
    mkdirSync(output.dir, { recursive: true });
  } catch {}
  writeFileSync(
    tmpFile,
    `
      import app from ${JSON.stringify(inputFile)};
      import { ${opts.asynchronous ? 'compileToHandler' : 'compileToHandlerSync'} } from '@mapl/web/compiler/${opts.target === 'bun' ? 'bun/' : ''}jit';

      export default {
        ${opts.target === 'bun' ? 'routes' : 'fetch'}: ${
          opts.asynchronous
            ? 'await compileToHandler(app)'
            : 'compileToHandlerSync(app)'
        }
      };
    `,
  );

  return watch({
    ...opts.buildOptions,
    input: tmpFile,
    output: {
      ...output,
      file: outputFile,
      dir: undefined,
    },
  });
};

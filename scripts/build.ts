/// <reference types='bun-types' />
import { existsSync, rmSync, symlinkSync } from 'node:fs';
import { transform } from 'oxc-transform';

import pkg from '../package.json';
import { cp, LIB, ROOT, SOURCE } from './utils.js';
import * as constants from '../src/constants.js';
import { minify } from 'oxc-minify';

// Remove old content
if (existsSync(LIB)) rmSync(LIB, { recursive: true });

// @ts-ignore
const exports = (pkg.exports = {} as Record<string, string>);
const defs = Object.fromEntries(
  Object.entries(constants).map((entry) => [
    `constants.${entry[0]}`,
    JSON.stringify(entry[1]),
  ]),
);

Array.fromAsync(new Bun.Glob('**/*.ts').scan(SOURCE))
  .then((paths) =>
    Promise.all(
      paths.map(async (path) => {
        const pathNoExt = path.substring(0, path.lastIndexOf('.') >>> 0);

        const transformed = transform(
          path,
          await Bun.file(`${SOURCE}/${path}`).text(),
          {
            sourceType: 'module',
            typescript: {
              declaration: {
                stripInternal: true,
              },
            },
            lang: 'ts',
            define: defs,
          },
        );

        Bun.write(`${LIB}/${pathNoExt}.d.ts`, transformed.declaration);
        if (transformed.code !== '')
          Bun.write(
            `${LIB}/${pathNoExt}.js`,
            minify(path, transformed.code.replace(/const /g, 'let '), {
              compress: false,
              mangle: false,
            }).code,
          );

        exports[
          pathNoExt === 'index'
            ? '.'
            : './' +
              (pathNoExt.endsWith('/index')
                ? pathNoExt.slice(0, -6)
                : pathNoExt)
        ] = './' + pathNoExt + (transformed.code === '' ? '.d.ts' : '.js');
      }),
    ),
  )
  .then(async () => {
    delete pkg.trustedDependencies;
    delete pkg.devDependencies;
    delete pkg.scripts;

    await Promise.all([
      Bun.write(LIB + '/package.json', JSON.stringify(pkg)),
      cp(ROOT, LIB, 'README.md'),
    ]);

    // Symlink @mapl/web to local node_modules
    const MAPL_WEB = ROOT + '/node_modules/@mapl/web';
    rmSync(MAPL_WEB, { recursive: true });
    symlinkSync(LIB, MAPL_WEB, 'dir');
  });

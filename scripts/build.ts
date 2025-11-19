/// <reference types='bun-types' />
import { existsSync, rmSync } from 'node:fs';
import { minify } from 'oxc-minify';
import { transform } from 'oxc-transform';
import pkg from '../package.json';
import { cp, LIB, linkLocalPackage, ROOT, SOURCE } from './utils.ts';

import * as constants from '../src/constants.ts';
const defs = Object.fromEntries(
  Object.entries(constants).map((entry) => [
    `constants.${entry[0]}`,
    JSON.stringify(entry[1]),
  ]),
);

// Remove old content
if (existsSync(LIB)) rmSync(LIB, { recursive: true });

// @ts-ignore
const exports = (pkg.exports = {} as Record<string, string>);

await Promise.all(
  [...new Bun.Glob('**/*.ts').scanSync(SOURCE)].map(async (path) => {
    const pathNoExt = path.slice(0, path.lastIndexOf('.') >>> 0);

    const transformed = transform(
      path,
      await Bun.file(`${SOURCE}/${path}`).text(),
      {
        sourceType: 'module',
        typescript: {
          rewriteImportExtensions: true,
          declaration: {
            stripInternal: true,
          },
        },
        lang: 'ts',
        define: defs,
      },
    );

    if (transformed.code !== '')
      Bun.write(
        `${LIB}/${pathNoExt}.js`,
        minify(
          path,
          transformed.code.replace(/const (.*) =/g, (a) =>
            a.replace('const', 'let'),
          ),
          {
            compress: false,
            mangle: false,
          },
        ).code,
      );

    if (transformed.declaration) {
      Bun.write(`${LIB}/${pathNoExt}.d.ts`, transformed.declaration);
      exports[
        pathNoExt === 'index'
          ? '.'
          : './' +
            (pathNoExt.endsWith('/index') ? pathNoExt.slice(0, -6) : pathNoExt)
      ] = './' + pathNoExt + (transformed.code === '' ? '.d.ts' : '.js');
    }
  }),
);

pkg.trustedDependencies = pkg.devDependencies = pkg.scripts = undefined as any;

Bun.write(LIB + '/package.json', JSON.stringify(pkg));
cp(ROOT, LIB, 'README.md');

linkLocalPackage('@mapl/web', LIB);

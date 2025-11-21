import { join, resolve } from 'node:path/posix';
import { $, file, write } from 'bun';
import { existsSync, rmSync, symlinkSync } from 'node:fs';

export const SCRIPTS = import.meta.dir;
export const ROOT = resolve(SCRIPTS, '..');
export const SOURCE = ROOT + '/src';
export const LIB = ROOT + '/lib';
export const BENCH = ROOT + '/bench';
export const EXAMPLES = ROOT + '/examples/src';
export const NODE_MODS = ROOT + '/node_modules';

export const cp = (from: string, to: string, path: string) =>
  write(join(to, path), file(join(from, path)));
export const exec = (...args: Parameters<typeof $>) =>
  $(...args).catch((err) => process.stderr.write(err.stderr as any));
export const cd = (dir: string) => $.cwd(dir);
export const linkLocalPackage = (name: string, source: string) => {
  const output = join(NODE_MODS, name);
  if (existsSync(output)) rmSync(output, { recursive: true });
  symlinkSync(source, output, 'dir');
};

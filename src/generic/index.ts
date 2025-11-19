import type { LocalDependency } from 'runtime-compiler';

export const request = constants.REQ as LocalDependency<Request>;

export * as compiler from './compiler.ts';

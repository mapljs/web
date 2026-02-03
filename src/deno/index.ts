import type { Identifier } from 'runtime-compiler';

export { request } from '../generic/index.ts';
export const info = constants.INFO as Identifier<
  Deno.ServeHandlerInfo<Deno.Addr>
>;

export { build } from './compiler.ts';

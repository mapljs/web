import type { Identifier } from 'runtime-compiler';

export * from '../generic/vars.ts';
export const info: Identifier<Deno.ServeHandlerInfo<Deno.Addr>> = constants.INFO as any;

import type { BunRequest, Server } from 'bun';
import type { Identifier } from 'runtime-compiler';

export const request = constants.REQ as Identifier<BunRequest>;
export const server = constants.INFO as Identifier<Server<any>>;

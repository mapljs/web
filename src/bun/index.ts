import type { BunRequest, Server } from 'bun';
import type { LocalDependency } from 'runtime-compiler';

export const request = constants.REQ as LocalDependency<BunRequest>;
export const server = constants.INFO as LocalDependency<Server<any>>;

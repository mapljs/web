import type {
  Request as WorkerRequest,
  ExecutionContext,
} from '@cloudflare/workers-types';
import type { Identifier } from 'runtime-compiler';

export const request = constants.REQ as Identifier<WorkerRequest>;
export const env = constants.INFO as Identifier<Cloudflare.Env>;
export const ctx = constants.EXEC_CTX as Identifier<ExecutionContext>;

export { build } from './compiler.ts';

import { proto } from './utils.js';

export type Header = [string, string] | readonly [string, string];
export type Headers = Header[];

export interface Context {
  req: Request;
  headers: Headers;
  status?: number;
  statusText?: string;
}

// Light object
const ctxProto = proto({
  req: undefined,
  headers: undefined,
  status: 200,
});

// Create a context
export default (req: Request): Context => {
  const obj: Context = Object.create(ctxProto);
  obj.headers = [];
  obj.req = req;
  return obj;
};

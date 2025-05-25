import { proto } from './utils.js';

export type Header = [string, string] | readonly [string, string];

export interface Context {
  req: Request;
  headers: Header[];
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
export default (req: Request, headers: Header[]): Context => {
  const obj: Context = Object.create(ctxProto);
  obj.headers = headers;
  obj.req = req;
  return obj;
};

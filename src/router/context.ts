import { proto } from './utils';

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
  req: null,
  headers: null,
  status: 200
});

export const createContext = (req: Request, headers: Headers): Context => {
  const obj: Context = Object.create(ctxProto);
  obj.headers = headers;
  obj.req = req;
  return obj;
};

export type Header = [string, string] | readonly [string, string];

export interface Context {
  status: number;
  headers: Header[];
}

export type MaybePromise<T> = T | Promise<T>;

export type RequestMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS'
  | 'TRACE'
  | (string & {});

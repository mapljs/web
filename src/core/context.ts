export type Header = [string, string] | readonly [string, string];

export interface Context {
  req: Request;
  headers: Header[];
  status?: number;
  statusText?: string;
}

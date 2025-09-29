export type Header = [string, string] | readonly [string, string];

export interface Context {
  headers: Header[];
  status?: number;
  statusText?: string;
}

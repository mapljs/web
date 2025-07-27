export type Header = [string, string] | readonly [string, string];

export interface Context {
  req: Request;
  headers: Header[];
  status?: number;
  statusText?: string;
}

// Create a context
export default (r: Request): Context => ({
  status: 200,
  req: r,
  headers: [],
});

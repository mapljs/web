import type { Header } from '../core/context.js';

export const parse = (req: Request): string | undefined => {
  const header = req.headers.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7);
};

export const realm = (val: string): Header => [
  'www-authenticate',
  'Basic realm=' + JSON.stringify(val),
];

export const error = (val: string): Header => [
  'www-authenticate',
  'Basic error=' + JSON.stringify(val),
];

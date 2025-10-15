import type { Header } from '../core/context.js';

export const parse = (
  req: Request,
):
  | {
      name: string;
      pwd: string;
    }
  | undefined => {
  const header = req.headers.get('authorization');
  if (header?.startsWith('Basic '))
    try {
      const sliced = atob(header.slice(6));

      const sep = sliced.indexOf(':');
      if (sep > -1)
        return {
          name: sliced.slice(0, sep),
          pwd: sliced.slice(sep + 1),
        };
    } catch {}
};

export const realm = (val: string): Header => [
  'www-authenticate',
  'Basic realm=' + JSON.stringify(val),
];

export const error = (val: string): Header => [
  'www-authenticate',
  'Basic error=' + JSON.stringify(val),
];

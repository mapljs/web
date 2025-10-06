export const extract = (
  req: Request,
):
  | {
      name: string;
      pwd: string;
    }
  | undefined => {
  const header = req.headers.get('authorization');
  if (header !== null && header.startsWith('Basic '))
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

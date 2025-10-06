import { summary, run, bench, do_not_optimize } from 'mitata';

// Example benchmark
summary(() => {
  const createReq = (name: string, pwd: string) =>
    new Request('http://localhost', {
      headers: {
        authorization: 'Basic ' + btoa(name + ':' + pwd),
      },
    });

  const register = (
    name: string,
    fn: (req: Request) =>
      | {
          name: string;
          pwd: string;
        }
      | undefined,
  ) => {
    bench(name, function* () {
      const res = fn(createReq('user64', 'pwd019'));
      if (res?.name !== 'user64' && res?.pwd !== 'pwd019')
        throw new Error('invalid implementation');

      yield {
        [0]: () => createReq(crypto.randomUUID(), crypto.randomUUID()),
        bench: (req: any) => {
          const res = fn(req);
          // Attempt to use the string
          do_not_optimize(res!.name === '');
          do_not_optimize(res!.pwd === '');
        },
      };
    }).gc('inner');
  };

  register('2 slice', (req) => {
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
  });
  register('split', (req) => {
    const header = req.headers.get('authorization');
    if (header !== null && header.startsWith('Basic '))
      try {
        const arr = atob(header.slice(6)).split(':', 2);
        if (arr.length === 2)
          return {
            name: arr[0],
            pwd: arr[1],
          };
      } catch {}
  });
});

// Start the benchmark
run();

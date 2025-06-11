import { summary, run, bench, do_not_optimize } from 'mitata';

// Example benchmark
summary(() => {
  const register = (label: string, fn: (l: [string, string][]) => any) => {
    bench(label, function* () {
      yield {
        [0]: () => [],
        bench: fn
      }
    });
  }

  {
    class Context {
      status: number;
      headers: [string, string][];

      constructor(headers: [string, string][]) {
        this.status = 200;
        this.headers = headers;
      }
    }

    register('Class constructor', (headers) => {
      do_not_optimize(new Context(headers));
    });
  }

  {
    class Context {
      // @ts-ignore
      status: number;
      // @ts-ignore
      headers: [string, string][];
    }

    register('Class constructor assign outside', (headers) => {
      const o = new Context();
      o.status = 200;
      o.headers = headers;
      do_not_optimize(o);
    });
  }

  {
    const proto = Object.assign(Object.create(null), {
      status: 200,
      headers: undefined
    });

    {
      register('Object.create', (headers) => {
        const o = Object.create(proto);
        o.status = 200;
        o.headers = headers;
        do_not_optimize(o);
      });

      {
        const Context = function (this: any, headers: [string, string][]) {
          this.status = 200;
          this.headers = headers;
        };
        Context.prototype = proto;

        register('Function', (headers) => {
          // @ts-ignore
          do_not_optimize(new Context(headers));
        });
      }

      {
        const Context = function () {};
        Context.prototype = proto;

        register('Function assign outside', (headers) => {
          // @ts-ignore
          const o = new Context();
          o.status = 200;
          o.headers = headers;
          do_not_optimize(o);
        });
      }
    }
  }

  bench('Normal', () => {
    do_not_optimize({ status: 200, headers: [] });
  });
});

// Start the benchmark
run();

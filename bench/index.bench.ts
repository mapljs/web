import { summary, run, bench, do_not_optimize } from 'mitata';

// Example benchmark
summary(() => {
  const sym = Symbol();

  bench('no field', function* () {
    const fn = (a: number) => Math.random() * a + 'p';
    yield {
      [0]: () => fn,
      bench(fn: any) {
        do_not_optimize(sym in fn);
      }
    }
  });

  bench('with symbol field', function* () {
    const fn = (a: number) => Math.random() * a + 'p';
    // @ts-ignore
    fn[sym] = Math.random();
    yield {
      [0]: () => fn,
      bench(fn: any) {
        do_not_optimize(sym in fn);
      }
    }
  });
});

// Start the benchmark
run();

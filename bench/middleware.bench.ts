import { summary, run, bench, do_not_optimize } from 'mitata';

// Example benchmark
summary(() => {
  {
    const f1 = function* (): Generator<undefined, number, number> {
      do_not_optimize(Math.random());
      const val = yield;
      do_not_optimize(Math.random());
      return val;
    };

    const f2 = () => {
      do_not_optimize(Math.random());
    };

    const f3 = () => Math.random();

    bench('generator', () => {
      const d1 = f1();
      d1.next();

      f2();
      const res = f3();

      do_not_optimize(d1.next(res).value);
    }).gc('inner');
  }

  {
    const f1_before = () => {
      do_not_optimize(Math.random());
    };

    const f1_after = (res: number) => {
      do_not_optimize(Math.random());
      return res;
    };

    const f2 = () => {
      do_not_optimize(Math.random());
    };

    const f3 = () => Math.random();

    bench('manual', () => {
      f1_before();

      f2();
      const res = f3();

      do_not_optimize(f1_after(res));
    }).gc('inner');
  }
});

// Start the benchmark
run();

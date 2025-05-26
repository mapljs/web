import { summary, run, bench, do_not_optimize } from "mitata";

import { hrtime } from "node:process";
import { basename, relative } from "node:path";

import tests from "./tests.js";
import frameworks from "./.out/index.js";

import "better-sqlite3";

// Log startup time
const req = new Request("http://127.0.0.1");

const imported = await Promise.all(
  frameworks.map(async (path: string) => {
    let start = hrtime.bigint();
    const res = (await import(path)).default;
    await res.fetch(req);
    start = hrtime.bigint() - start;

    console.log(
      relative(".", path),
      "took",
      start / 1000n,
      "us",
      "-",
      start / 1000000n,
      "ms",
    );

    return {
      handler: res as { fetch: (req: Request) => any },
      name: basename(path, ".js"),
    };
  }),
);

for (const test of tests) {
  const passed: typeof imported = [];

  const name = test.method + " " + test.path;
  const tester = test.fn();

  for (const framework of imported) {
    const { handler } = framework;

    // Test framework
    try {
      await tester.expect(await handler.fetch(tester.request));
    } catch (e) {
      console.error(e);
      console.error(name, "-", framework.name, "failed");
      continue;
    }

    console.log(name, "-", framework.name, "passed");
    passed.push(framework);
  }

  summary(() => {
    for (const framework of passed) {
      // Register bench
      bench(name + " - " + framework.name, function* () {
        const { handler } = framework;

        yield {
          [0]: test.fn,
          async bench(r: { request: Request }) {
            do_not_optimize(await handler.fetch(r.request));
          },
        };
      });
    }
  });
}

run();

// @ts-check
import { dev } from "@mapl/web/build/rolldown";
import { restartServer } from "../server/index.js";
import { buildOptions } from "../mapl.config.js";

/**
 * @type {import("node:child_process").ChildProcess}
 */
dev({
  ...buildOptions.common,
  ...buildOptions.dev,
}).on("event", (e) => {
  // Each time bundle ends restart the server
  if (e.code === "BUNDLE_END") restartServer();
});

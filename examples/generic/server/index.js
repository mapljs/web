// @ts-check
import child_process from "node:child_process";

/**
 * @type {import("node:child_process").ChildProcess | undefined | null}
 */
let proc;

/**
 * @type {ReturnType<typeof Promise.withResolvers>}
 */
let latch;

/**
 * Start a new server or relaunch the old server
 */
export const restartServer = async () => {
  if (proc != null) {
    proc.kill("SIGINT");

    // Wait until process closed
    await latch.promise;
  }

  console.log("Starting server...");

  latch = Promise.withResolvers();
  proc = child_process
    .fork("./server/main.js", {
      stdio: "inherit",
    })
    .once("exit", (code, sig) => {
      proc = null;
      latch.resolve();

      // Don't log for sigint
      if (sig !== "SIGINT")
        console.log("Server exited: status code", code, "signal", sig);
    });
};

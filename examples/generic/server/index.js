// @ts-check
import child_process from "node:child_process";

/**
 * @type {import("node:child_process").ChildProcess | undefined}
 */
let proc;

/**
 * Start a new server or relaunch the old server
 */
export const restartServer = () => {
  if (proc != null) {
    proc.kill("SIGINT");
    console.log("Killed old server!");
  }

  proc = child_process
    .fork("./server/main.js", {
      stdio: "inherit",
    })
    .once("exit", (code, sig) => {
      // Don't log when killed by Ctrl+C
      if (sig !== "SIGINT")
        console.log("Server exited: status code", code, "signal", sig);
      proc = undefined;
    });
};

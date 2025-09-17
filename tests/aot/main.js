// @ts-check
import { isHydrating } from "runtime-compiler/config";
import { cors, handle, layer, router, staticHeaders } from "../../lib/index.js";
import {
  injectDependency,
  getDependency,
  exportDependency,
  markExported,
} from "runtime-compiler";

const logRequest = isHydrating
  ? markExported()
  : exportDependency(injectDependency("(r) => console.log(r.method, r.url)"));

export default router(
  [
    cors.init("*", [cors.maxAge(60000)]),
    layer.tap((c) => getDependency(logRequest)(c.req)),
    layer.attach("id", () => performance.now()),
    staticHeaders({
      "x-powered-by": "@mapl/web",
    }),
  ],
  [handle.any("/path", (c) => c.id)],
  {
    "/api": router(
      [layer.attach("body", async (c) => c.req.text())],
      [handle.post("/body", (c) => c.body)],
    ),
  },
);

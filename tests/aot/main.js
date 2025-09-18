// @ts-check
import { isHydrating } from "runtime-compiler/config";
import { cors, handle, layer, router, staticHeaders } from "../../lib/index.js";
import {
  injectDependency,
  getDependency,
  exportDependency,
  markExported,
} from "runtime-compiler";
import * as bodyParser from "@mapl/stnl/body-parser";
import { t } from "stnl";

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
  [handle.any("/path", (c) => "" + c.id)],
  {
    "/api": router(
      [
        bodyParser.json(
          "body",
          t.dict({
            name: t.string,
            pwd: t.string,
          }),
        ),
      ],
      [handle.post("/body", (c) => c.body, handle.json)],
    ),
  },
);

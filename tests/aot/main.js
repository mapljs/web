// @ts-check
import { cors, handle, router, staticHeaders } from "../../lib/index.js";
import * as bodyParser from "@mapl/stnl/body-parser";
import { t } from "stnl";

export default router(
  [
    cors.init("*", [cors.maxAge(60000)]),
    staticHeaders({
      "x-powered-by": "@mapl/web",
    }),
  ],
  [handle.any("/path", () => "" + performance.now())],
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

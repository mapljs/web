import { router, bodyParser, handle, compile } from "@mapl/web";

const app = router([bodyParser.text], [handle.post("/body", (c) => c.body)]);

export default {
  fetch: compile(app),
};

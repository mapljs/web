import { compile, cors, handle, router } from "@mapl/web";

const app = router(
  [cors.init("*", [cors.maxAge(96000)])],
  [handle.get("/", () => "Hi")],
);

export default {
  fetch: compile(app),
};

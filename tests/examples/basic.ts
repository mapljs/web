import { router, layer, handle, compile, st } from "@mapl/web";

const subrouter = router([], [handle.get("/", () => "Hello")]);
const app = router(
  // Middlewares
  [
    layer.tap((c) => {
      console.log(c.req);
    }),
    layer.attach("id", () => performance.now()),
    layer.validate(() => {
      if (Math.random() < 0.5) return st.err("Random");
    }),
  ],

  // Route handlers
  [
    handle.get("/path", (c) => c.id),
    handle.post("/body", async (c) => c.req.text()),
  ],

  // Subrouters
  {
    "/api": subrouter,
  },
);

export default {
  fetch: compile(app),
};

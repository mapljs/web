import { Hono } from "hono";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { db, pages } from "../lib/index.js";

const books = new Hono()
  .get("/", (c) => c.json(db.getAllBooks.all()))
  .get("/:id", (c) => c.json(db.getBook.get(c.req.param("id")) as any))
  .get("/:id/reviews", (c) =>
    c.json(db.getAllReviews.all(c.req.param("id")) as any),
  );

const authors = new Hono()
  .get("/", (c) => c.json(db.getAllAuthors.all()))
  .get("/:id", (c) => c.json(db.getAuthor.get(c.req.param("id")) as any));

const app = new Hono({ router: new RegExpRouter() })
  .get("/", (c) => c.html(pages.home))
  .route("/books", books)
  .route("/authors", authors);

export default app;

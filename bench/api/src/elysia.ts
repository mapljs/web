import { Elysia } from 'elysia';
import { db, pages } from '../lib/index.js';
import { cors } from '@elysiajs/cors';

const books = new Elysia({ prefix: '/books' })
  .get('/', () => db.getAllBooks.all())
  .get('/:id', (c) => db.getBook.get(c.params.id))
  .get('/:id/reviews', (c) => db.getAllReviews.all(c.params.id));

const authors = new Elysia({ prefix: '/authors' })
  .get('/', () => db.getAllAuthors.all())
  .get('/:id', (c) => db.getAuthor.get(c.params.id));

const app = new Elysia()
  .use(cors())
  .get('/', ({ set }) => {
    set.headers['content-type'] = 'text/html';
    return pages.home;
  })
  .use(books)
  .use(authors);

export default app;

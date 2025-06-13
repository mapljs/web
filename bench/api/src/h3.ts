import { H3, handleCors, withBase } from 'h3';
import { db, pages } from '../lib/index.js';

const books = new H3()
  .get('/', () => db.getAllBooks.all())
  .get('/:id', (c) => db.getBook.get(c.context.params!.id))
  .get('/:id/reviews', (c) => db.getAllReviews.all(c.context.params!.id));

const authors = new H3()
  .get('/', () => db.getAllAuthors.all())
  .get('/:id', (c) => db.getAuthor.get(c.context.params!.id));

const cors = {
  origin: '*',
  preflight: {
    statusCode: 204,
  },
  methods: '*',
} as const;

const app = new H3()
  .use((c, next) => handleCors(c, cors) || next())
  .get('/', (c) => {
    c.res.headers.set('Content-Type', 'text/html');
    return pages.home;
  })
  .all('/books/**', withBase('/books', books.handler))
  .all('/authors/**', withBase('/authors', authors.handler));

export default app;

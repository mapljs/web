import { handler, router } from '../../../lib/index.js';
import { db, pages } from '../lib/index.js';

const books = router.init(
  [],
  [
    handler.get('/', () => db.getAllBooks.all(), handler.json),
    handler.get('/*', (id) => db.getBook.get(id), handler.json),
    handler.get('/*/reviews', (id) => db.getAllReviews.get(id), handler.json),
  ],
);

const authors = router.init(
  [],
  [
    handler.get('/', () => db.getAllAuthors.all(), handler.json),
    handler.get('/*', (id) => db.getAuthor.get(id), handler.json),
  ],
);

const app = router.init(
  [],
  [handler.get('/', () => pages.home, handler.html)],
  {
    '/books': books,
    '/authors': authors,
  },
);

export default {
  fetch: router.compile(app),
};

import { compile, handle, router } from '../../../lib/index.js';
import { db, pages } from '../lib/index.js';

const books = router(
  [],
  [
    handle.get('/', () => db.getAllBooks.all(), handle.json),
    handle.get('/*', (id) => db.getBook.get(id), handle.json),
    handle.get('/*/reviews', (id) => db.getAllReviews.get(id), handle.json),
  ],
);

const authors = router(
  [],
  [
    handle.get('/', () => db.getAllAuthors.all(), handle.json),
    handle.get('/*', (id) => db.getAuthor.get(id), handle.json),
  ],
);

const app = router([], [handle.get('/', () => pages.home, handle.html)], {
  '/books': books,
  '/authors': authors,
});

export default {
  fetch: compile(app),
};

import { handler, router } from '@mapl/web';
import {
  getAllAuthors,
  getAllBooks,
  getAllReviews,
  getAuthor,
  getBook,
} from '../lib/db.js';

const books = router.init(
  [],
  [
    handler.get('/', () => getAllBooks.all(), handler.json),
    handler.get('/*', (id) => getBook.get(id), handler.json),
    handler.get('/*/reviews', (id) => getAllReviews.get(id), handler.json),
  ],
);

const authors = router.init(
  [],
  [
    handler.get('/', () => getAllAuthors.all(), handler.json),
    handler.get('/*', (id) => getAuthor.get(id), handler.json),
  ],
);

const app = router.init([], [handler.get('/', () => 'Hi')], {
  '/books': books,
  '/authors': authors,
});

export default {
  fetch: router.compile(app),
};

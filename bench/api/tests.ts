import * as assert from 'node:assert/strict';
import data from './setup/data.json';
import { pages } from './lib/index.js';

export interface Test {
  path: string;
  method: string;

  fn: () => {
    request: Request;
    expect: (res: Response) => void | Promise<void>;
  };
}

export const selectRandom = <T>(list: T[]): T =>
  list[Math.round(Math.random() * (list.length - 1))];

const basicCheck = (res: Response) => {
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
};

export default [
  {
    path: '/',
    method: 'GET',

    fn: () => ({
      request: new Request('http://127.0.0.1'),
      expect: async (res) => {
        basicCheck(res);
        assert.match(res.headers.get('Content-Type') ?? '', /^text\/html/);
        assert.equal(await res.text(), pages.home);
      },
    }),
  },

  {
    path: '/books',
    method: 'GET',

    fn: () => ({
      request: new Request('http://127.0.0.1/books'),
      expect: async (res) => {
        basicCheck(res);
        assert.deepEqual(await res.json(), data.books);
      },
    }),
  },

  {
    path: '/books/{id}',
    method: 'GET',

    fn: () => {
      const book = selectRandom(data.books);

      return {
        request: new Request('http://127.0.0.1/books/' + book.id),
        expect: async (res) => {
          basicCheck(res);
          assert.deepEqual(await res.json(), book);
        },
      };
    },
  },

  {
    path: '/books/{id}/reviews',
    method: 'GET',

    fn: () => {
      const book = selectRandom(data.books);
      const reviews = data.reviews.filter((r) => r.book_id === book.id);

      return {
        request: new Request('http://127.0.0.1/books/' + book.id + '/reviews'),
        expect: async (res) => {
          basicCheck(res);
          assert.deepEqual(await res.json(), reviews);
        },
      };
    },
  },

  {
    path: '/authors',
    method: 'GET',

    fn: () => ({
      request: new Request('http://127.0.0.1/authors'),
      expect: async (res) => {
        basicCheck(res);
        assert.deepEqual(await res.json(), data.authors);
      },
    }),
  },

  {
    path: '/authors/{id}',
    method: 'GET',

    fn: () => {
      const author = selectRandom(data.authors);

      return {
        request: new Request('http://127.0.0.1/authors/' + author.name),
        expect: async (res) => {
          basicCheck(res);
          assert.deepEqual(await res.json(), author);
        },
      };
    },
  },
] as Test[];

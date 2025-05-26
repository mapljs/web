import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';

const db = new Database(fileURLToPath(new URL('../.db', import.meta.url)));
db.pragma('journal_mode = WAL');
export default db;

export const getAllBooks = db.prepare('SELECT * FROM books');
export const getBook = db.prepare('SELECT * FROM books WHERE id = ?');
export const getAllReviews = db.prepare(
  'SELECT * FROM reviews WHERE book_id = ?',
);

export const getAllAuthors = db.prepare('SELECT * FROM authors');
export const getAuthor = db.prepare('SELECT * FROM authors WHERE name = ?');

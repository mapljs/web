import db from '../lib/db.js';
import data from './data.json';

db.transaction(() => {
  db.exec(`
    CREATE TABLE authors (
      name TEXT PRIMARY KEY,
      display_name TEXT NOT NULL
    );

    CREATE TABLE books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL REFERENCES authors(name),
      published_date TEXT
    );

    CREATE TABLE reviews (
      book_id TEXT NOT NULL REFERENCES books(id),
      reviewer TEXT,
      published_date TEXT,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      content TEXT
    );
  `);

  {
    const insert = db.prepare(
      'INSERT INTO authors VALUES (@name, @display_name)',
    );
    for (const item of data.authors) insert.run(item);
  }

  {
    const insert = db.prepare(
      'INSERT INTO books VALUES (@id, @title, @author, @published_date)',
    );
    for (const item of data.books) insert.run(item);
  }

  {
    const insert = db.prepare(
      'INSERT INTO reviews VALUES (@book_id, @reviewer, @published_date, @rating, @content)',
    );
    for (const item of data.reviews) insert.run(item);
  }
})();

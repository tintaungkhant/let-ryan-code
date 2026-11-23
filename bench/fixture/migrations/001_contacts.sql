CREATE TABLE contacts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  fax TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

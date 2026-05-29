const Database = require("better-sqlite3");

const db = new Database("questions.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    input TEXT,
    output TEXT,
    starterCode TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

module.exports = db;
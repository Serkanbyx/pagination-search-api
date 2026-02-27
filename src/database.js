const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "items.db");

let db;

const getDatabase = () => {
  if (!db) {
    const fs = require("fs");
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id    INTEGER PRIMARY KEY AUTOINCREMENT,
        name  TEXT    NOT NULL,
        category TEXT NOT NULL,
        price REAL    NOT NULL,
        description TEXT
      )
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_items_name     ON items(name);
      CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
      CREATE INDEX IF NOT EXISTS idx_items_price    ON items(price);
    `);
  }
  return db;
};

module.exports = { getDatabase };

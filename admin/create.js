// setup-db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        longitude TEXT,
        latitude TEXT,
        weight REAL,
        price REAL,
        name TEXT,
        type TEXT,
        identifier TEXT UNIQUE,
        image BLOB
    )`);
});

db.close();

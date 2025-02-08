import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../data/auction.db');

export const db = new sqlite3.Database(DB_PATH);

// Enable foreign key constraints
db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");
});

export default db;
// database/migrations/01_initial_schema.ts
import sqlite3 from 'sqlite3';


export function createInitialSchema(db: sqlite3.Database): Promise<void> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            try {
                // Enable foreign keys
                db.run("PRAGMA foreign_keys = ON");

                // Create admin_auth table
                db.run(`
                    CREATE TABLE IF NOT EXISTS admin_auth (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        access_code TEXT UNIQUE NOT NULL
                    )
                `);

                // Create crew_members table
                db.run(`
                    CREATE TABLE IF NOT EXISTS crew_members (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        category TEXT NOT NULL,
                        rating INTEGER NOT NULL,
                        base_price INTEGER NOT NULL,
                        current_bid INTEGER,
                        status TEXT DEFAULT 'available'
                    )
                `);

                // Create production_houses table
                db.run(`
                    CREATE TABLE IF NOT EXISTS production_houses (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        budget INTEGER NOT NULL,
                        access_code TEXT UNIQUE NOT NULL
                    )
                `);

                // Create purchased_crew table
                db.run(`
                    CREATE TABLE IF NOT EXISTS purchased_crew (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        production_house_id INTEGER,
                        crew_member_id INTEGER,
                        purchase_price INTEGER NOT NULL,
                        FOREIGN KEY(production_house_id) REFERENCES production_houses(id),
                        FOREIGN KEY(crew_member_id) REFERENCES crew_members(id)
                    )
                `, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });

            } catch (error) {
                reject(error);
            }
        });
    });
}
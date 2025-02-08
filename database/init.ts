// database/init.ts
import sqlite3 from 'sqlite3';
import path from 'path';
import { debugLog } from '../server/src/utils/debuglogger';

const DB_PATH = path.join(__dirname, '../server/data/auction.db');

async function initializeDatabase() {
    debugLog(`Initializing database at: ${DB_PATH}`);
    
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            debugLog('Error opening database: ' + err.message);
            return;
        }
        debugLog('Connected to the auction database.');
    });
    try {
        // Enable foreign keys
        await runQuery(db, "PRAGMA foreign_keys = ON");

        // Create admin_auth table
        await runQuery(db, `
            CREATE TABLE IF NOT EXISTS admin_auth (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                access_code TEXT UNIQUE NOT NULL
            )
        `);

        // Create crew_members table
        await runQuery(db, `
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
        await runQuery(db, `
            CREATE TABLE IF NOT EXISTS production_houses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                budget INTEGER NOT NULL,
                access_code TEXT UNIQUE NOT NULL
            )
        `);

        // Create purchased_crew table
        await runQuery(db, `
            CREATE TABLE IF NOT EXISTS purchased_crew (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                production_house_id INTEGER,
                crew_member_id INTEGER,
                purchase_price INTEGER NOT NULL,
                FOREIGN KEY(production_house_id) REFERENCES production_houses(id),
                FOREIGN KEY(crew_member_id) REFERENCES crew_members(id)
            )
        `);

        // Clear existing data
        await runQuery(db, "DELETE FROM purchased_crew");
        await runQuery(db, "DELETE FROM crew_members");
        await runQuery(db, "DELETE FROM production_houses");
        await runQuery(db, "DELETE FROM admin_auth");

        // Insert admin access code
        await runQuery(db, 
            "INSERT INTO admin_auth (id, access_code) VALUES (1, 'ADMIN_MASTER_123')"
        );

        // Insert test crew members
        const crewMembers = [
            ['Shah Rukh Khan', 'Lead Actor', 95, 30000000],
            ['Deepika Padukone', 'Lead Actor', 90, 25000000],
            ['Nawazuddin Siddiqui', 'Supporting Actor', 88, 15000000],
            ['AR Rahman', 'Musician', 96, 20000000],
            ['Rohit Shetty', 'Director', 85, 20000000],
            ['Ibrahim Khan', 'Nepo Kid', 70, 5000000],
            ['Johnny Lever', 'Comedic Relief', 85, 10000000]
        ];

        for (const member of crewMembers) {
            await runQuery(db, `
                INSERT INTO crew_members (name, category, rating, base_price, current_bid)
                VALUES (?, ?, ?, ?, ?)
            `, [...member, member[3]]);
        }

        // Insert test production houses
        const productionHouses = [
            ['Red Chillies', 1000000000, 'RED001'],
            ['Dharma Productions', 1000000000, 'DHA001'],
            ['Yash Raj Films', 1000000000, 'YRF001']
        ];

        for (const house of productionHouses) {
            await runQuery(db, `
                INSERT INTO production_houses (name, budget, access_code)
                VALUES (?, ?, ?)
            `, house);
        }

        debugLog('Database initialized with test data!');

    } catch (error) {
        debugLog('Error initializing database: ' + error);
    } finally {
        db.close((err) => {
            if (err) {
                debugLog('Error closing database: ' + err.message);
                return;
            }
            debugLog('Database connection closed.');
        });
    }
}

function runQuery(db: sqlite3.Database, sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Run initialization
initializeDatabase();
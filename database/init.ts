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
            // LEADS
            ['Aamir Khan', 'Lead Actor', 96, 10000000],
            ['Alia Bhatt', 'Lead Actor', 94, 5000000],
            ['Amitabh Bachan', 'Lead Actor', 99, 20000000],
            ['Amrish Puri', 'Lead Actor', 98, 20000000],
            ['Ana de Armas', 'Lead Actor', 88, 5000000],
            ['Anne Hatheway', 'Lead Actor', 98, 20000000],
            ['Benedict Cumberbatch', 'Lead Actor', 96, 10000000],
            ['Chris Evans', 'Lead Actor', 94, 5000000],
            ['Chuck Norris', 'Lead Actor', 95, 10000000],
            ['Cillian Murphy', 'Lead Actor', 95, 10000000],
            ['Deepika Padukone', 'Lead Actor', 94, 5000000],
            ['Elizabeth Olsen', 'Lead Actor', 92, 5000000],
            ['George Clooney', 'Lead Actor', 100, 30000000],
            ['Himesh Reshamiya', 'Lead Actor', 96, 10000000],
            ['Irfan Khan', 'Lead Actor', 97, 10000000],
            ['Jake Gyllenhall', 'Lead Actor', 95, 10000000],
            ['Johnny Depp', 'Lead Actor', 97, 10000000],
            ['Kamal Hassan', 'Lead Actor', 95, 10000000],
            ['Leonardo DiCaprio', 'Lead Actor', 99, 20000000],
            ['Madhubala', 'Lead Actor', 90, 5000000],
            ['Madhuri Dixit', 'Lead Actor', 94, 5000000],
            ['Mahesh Babu', 'Lead Actor', 100, 30000000],
            ['Margot Robbie', 'Lead Actor', 99, 20000000],
            ['Meryl Streep', 'Lead Actor', 99, 20000000],
            ['Morgan Freeman', 'Lead Actor', 90, 5000000],
            ['Nawazudin Siddiqui', 'Lead Actor', 94, 5000000],
            ['Prabhas', 'Lead Actor', 98, 20000000],
            ['Priyanka Chopra', 'Lead Actor', 100, 30000000],
            ['Rajkumar Rao', 'Lead Actor', 93, 5000000],
            ['Rajnikant', 'Lead Actor', 93, 5000000],
            ['Ranbir Kapoor', 'Lead Actor', 98, 20000000],
            ['Ranveer Singh', 'Lead Actor', 93, 10000000],
            ['Robert De Niro', 'Lead Actor', 94, 5000000],
            ['Robert Downey Jr', 'Lead Actor', 94, 5000000],
            ['Ryan Reynolds', 'Lead Actor', 96, 10000000],
            ['Salman Khan', 'Lead Actor', 93, 5000000],
            ['Shah Rukh Khan', 'Lead Actor', 97, 10000000],
            ['Timothée Chalamet', 'Lead Actor', 97, 10000000],
            ['Tom Cruise', 'Lead Actor', 92, 5000000],
            ['Tom Hanks', 'Lead Actor', 94, 5000000],
            ['Tom Holland', 'Lead Actor', 88, 5000000],
            ['Zendaya', 'Lead Actor', 99, 20000000],

            // SUPPORTING ACTORS
            ['Alexandra Daddario', 'Supporting Actor', 93, 5000000],
            ['Kat Dennings', 'Supporting Actor', 90, 5000000],
            ['John Krasinski', 'Supporting Actor', 95, 10000000],
            ['Emily Blunt', 'Supporting Actor', 95, 10000000],
            ['Blake Lively', 'Supporting Actor', 92, 5000000],
            ['Angela Bassett', 'Supporting Actor', 96, 10000000],
            ['Supriya Pathak', 'Supporting Actor', 96, 10000000],
            ['Cate Blanchett', 'Supporting Actor', 100, 30000000],
            ['Dhanush', 'Supporting Actor', 94, 5000000],
            ['Pankaj Tripathi', 'Supporting Actor', 96, 10000000],
            ['R Madhavan', 'Supporting Actor', 93, 5000000],
            ['Manoj Bajpayee', 'Supporting Actor', 97, 10000000],
            ['Katrina Kaif', 'Supporting Actor', 91, 5000000],
            ['Vicky Kaushal', 'Supporting Actor', 93, 5000000],
            ['Paresh Rawal', 'Supporting Actor', 95, 10000000],
            ['Amber Heard', 'Supporting Actor', 91, 5000000],
            ['Ariana Grande', 'Supporting Actor', 87, 5000000],
            ['Kate Winslet', 'Supporting Actor', 94, 5000000],
            ['Winona Ryder', 'Supporting Actor', 95, 10000000],
            ['Owen Wilson', 'Supporting Actor', 93, 5000000],
            ['Deepak Dobriyal', 'Supporting Actor', 92, 5000000],
            ['Naseeruddin Shah', 'Supporting Actor', 100, 30000000],
            ['Vikrant Massey', 'Supporting Actor', 95, 10000000],
            ['Neena Gupta', 'Supporting Actor', 94, 5000000],
            ['Konkana Sen', 'Supporting Actor', 95, 10000000],
            ['Anil Kapoor', 'Supporting Actor', 97, 10000000],
            ['Kalki Kochein', 'Supporting Actor', 94, 5000000],
            ['Jacob Elordi', 'Supporting Actor', 90, 5000000],
            ['Steve Carell', 'Supporting Actor', 97, 10000000],
            ['Arshad Warsi', 'Supporting Actor', 95, 5000000],

            // MUSICIANS
            ['Kendrick Lamar', 'Musician', 97, 10000000],
            ['Hans Zimmer', 'Musician', 100, 30000000],
            ['Vishal Shekhar', 'Musician', 94, 5000000],
            ['Amit Trivedi', 'Musician', 95, 10000000],
            ['Manoj Tiwari', 'Musician', 96, 10000000],
            ['Pritam', 'Musician', 95, 10000000],
            ['Kishore Kumar', 'Musician', 100, 30000000],
            ['Salim Suleiman', 'Musician', 94, 5000000],
            ['Mozart', 'Musician', 97, 10000000],
            ['RD Burman', 'Musician', 97, 10000000],
            ['Taylor Swift', 'Musician', 90, 5000000],
            ['Neha Kakkar', 'Musician', 87, 5000000],
            ['John Williams', 'Musician', 99, 20000000],
            ['Ludwig van Beethoven', 'Musician', 97, 10000000],
            ['Kanye West', 'Musician', 96, 10000000],
            ['Honey Singh', 'Musician', 89, 5000000],
            ['Mika Singh', 'Musician', 93, 5000000],
            ['A.R. Rahman', 'Musician', 100, 30000000],
            ['Shankar Mahadevan', 'Musician', 96, 10000000],
            ['Kesari Lal Yadav', 'Musician', 92, 5000000],
            ['Sachin Jigar', 'Musician', 93, 5000000],
            ['Nusrat Fateh Ali Khan', 'Musician', 96, 10000000],
            ['Ludwig Göransson', 'Musician', 95, 10000000],
            ['Raftaar', 'Musician', 90, 5000000],
            ['Michael Jackson', 'Musician', 96, 10000000],

            // DIRECTORS
            ['Anurag Kashyap', 'Director', 99, 20000000],
            ['Christopher Nolan', 'Director', 99, 20000000],
            ['Ekta Kapoor', 'Director', 88, 5000000],
            ['Imtiaz Ali', 'Director', 93, 5000000],
            ['James Cameron', 'Director', 96, 10000000],
            ['Karan Johar', 'Director', 93, 5000000],
            ['Martin Scorscese', 'Director', 100, 30000000],
            ['S. S. Rajamouli', 'Director', 98, 20000000],
            ['Rajkumar Hirani', 'Director', 94, 5000000],
            ['Ram Gopal Verma', 'Director', 94, 5000000],
            ['Sandeep Reddy Vanga', 'Director', 69, 5000000],
            ['Sanjay Leela Bhansali', 'Director', 96, 10000000],
            ['Steven Spielberg', 'Director', 95, 10000000],
            ['Quentin Tarantino', 'Director', 100, 30000000],

            // COMEDIC RELIEF
            ['Ali Wong', 'Comedic Relief', 94, 5000000],
            ['Boman Irani', 'Comedic Relief', 94, 5000000],
            ['Chunky Pandey', 'Comedic Relief', 90, 5000000],
            ['Jim Carrey', 'Comedic Relief', 95, 10000000],
            ['Johnny Lever', 'Comedic Relief', 97, 10000000],
            ['Jack Black', 'Comedic Relief', 96, 10000000],
            ['Jonah hill', 'Comedic Relief', 92, 5000000],
            ['Kader Khan', 'Comedic Relief', 99, 20000000],
            ['Kevin Hart', 'Comedic Relief', 94, 5000000],
            ['Mehmood', 'Comedic Relief', 98, 20000000],
            ['Mindy Kaling', 'Comedic Relief', 92, 5000000],
            ['Rainn Wilson', 'Comedic Relief', 93, 5000000],
            ['Rajpal Yadav', 'Comedic Relief', 94, 5000000],
            ['Rowan Atkinson', 'Comedic Relief', 99, 20000000],
            ['Brahmanandam', 'Comedic Relief', 95, 10000000],

            // NEPO KIDS
            ['Abhishek Bacchan', 'Nepo Kid', 90, 5000000],
            ['Ananya Pandey', 'Nepo Kid', 86, 2500000],
            ['Emma Roberts', 'Nepo Kid', 89, 5000000],
            ['Harshwardhan Kapoor', 'Nepo Kid', 84, 2500000],
            ['Ishaan Khatter', 'Nepo Kid', 90, 5000000],
            ['Jaden Smith', 'Nepo Kid', 84, 2500000],
            ['Jhanvi Kapoor', 'Nepo Kid', 85, 2500000],
            ['Lily Rose Depp', 'Nepo Kid', 90, 5000000],
            ['Margaret Qualley', 'Nepo Kid', 88, 5000000],
            ['Maya Hawke', 'Nepo Kid', 89, 5000000],
            ['Sara Ali Khan', 'Nepo Kid', 84, 2500000],
            ['Suhana Khan', 'Nepo Kid', 83, 2500000],
            ['Tiger Shroff', 'Nepo Kid', 83, 2500000],
            ['Varun Dhawan', 'Nepo Kid', 87, 5000000],
            ['Zoe Kravitz', 'Nepo Kid', 86, 2500000]
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
            ['Yash Raj Films', 1000000000, 'YRF001'],
            ['Weinstein Company', 1000000000, 'WEIN001'],
            ['Disney', 1000000000, 'DIS001'],
            ['Fox Studios', 1000000000, 'FOX001'],
            ['Paramount Pictures', 1000000000, 'PAR001'],
            ['DreamWorks', 1000000000, 'DW001'],
            ['Warner Brothers', 1000000000, 'WB001']
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
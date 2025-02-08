// database/seeds/initial_data.ts
import sqlite3 from 'sqlite3';

export function seedInitialData(db: sqlite3.Database): Promise<void> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            try {
                // Clear existing data
                db.run("DELETE FROM purchased_crew");
                db.run("DELETE FROM crew_members");
                db.run("DELETE FROM production_houses");
                db.run("DELETE FROM admin_auth");

                // Insert admin access code
                db.run(
                    "INSERT OR REPLACE INTO admin_auth (id, access_code) VALUES (1, 'ADMIN_MASTER_123')"
                );

                // Insert crew members
                const crewMembers = [
                    ['Shah Rukh Khan', 'Lead Actor', 95, 30000000],
                    ['Deepika Padukone', 'Lead Actor', 90, 25000000],
                    ['Nawazuddin Siddiqui', 'Supporting Actor', 88, 15000000],
                    ['AR Rahman', 'Musician', 96, 20000000],
                    ['Rohit Shetty', 'Director', 85, 20000000],
                    ['Ibrahim Khan', 'Nepo Kid', 70, 5000000],
                    ['Johnny Lever', 'Comedic Relief', 85, 10000000]
                ];

                const insertCrew = db.prepare(`
                    INSERT INTO crew_members (name, category, rating, base_price, current_bid)
                    VALUES (?, ?, ?, ?, ?)
                `);

                crewMembers.forEach(member => {
                    insertCrew.run([
                        member[0],
                        member[1],
                        member[2],
                        member[3],
                        member[3]
                    ]);
                });

                insertCrew.finalize();

                // Insert production houses
                const productionHouses = [
                    ['Red Chillies', 1000000000, 'RED001'],
                    ['Dharma Productions', 1000000000, 'DHA001'],
                    ['Yash Raj Films', 1000000000, 'YRF001']
                ];

                const insertHouse = db.prepare(`
                    INSERT INTO production_houses (name, budget, access_code)
                    VALUES (?, ?, ?)
                `);

                productionHouses.forEach(house => {
                    insertHouse.run(house);
                });

                insertHouse.finalize();

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
}
// server/src/services/saleService.ts
import db from '../config/database';
import { SaleResult } from '../types';

export async function processSaleTransaction(
    crewMemberId: number,
    productionHouseId: number,
    purchasePrice: number
): Promise<SaleResult> {
    return new Promise((resolve) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            db.get(
                "SELECT budget FROM production_houses WHERE id = ?",
                [productionHouseId],
                (err, house: { budget: number } | undefined) => {
                    if (err || !house || house.budget < purchasePrice) {
                        db.run("ROLLBACK");
                        resolve({
                            success: false,
                            error: err ? err.message : (!house ? "House not found" : "Insufficient budget")
                        });
                        return;
                    }

                    db.run(
                        "UPDATE crew_members SET status = 'sold' WHERE id = ? AND status != 'sold'",
                        [crewMemberId],
                        function (err) {
                            if (err || this.changes === 0) {
                                db.run("ROLLBACK");
                                resolve({ success: false, error: "Crew member unavailable" });
                                return;
                            }

                            db.run(
                                "UPDATE production_houses SET budget = budget - ? WHERE id = ?",
                                [purchasePrice, productionHouseId],
                                function (err) {
                                    if (err || this.changes === 0) {
                                        db.run("ROLLBACK");
                                        resolve({ success: false, error: "Budget update failed" });
                                        return;
                                    }

                                    db.run(
                                        "INSERT INTO purchased_crew (production_house_id, crew_member_id, purchase_price) VALUES (?, ?, ?)",
                                        [productionHouseId, crewMemberId, purchasePrice],
                                        function (err) {
                                            if (err) {
                                                db.run("ROLLBACK");
                                                resolve({ success: false, error: "Failed to record purchase" });
                                                return;
                                            }

                                            db.run("COMMIT", (err) => {
                                                if (err) {
                                                    db.run("ROLLBACK");
                                                    resolve({ success: false, error: "Transaction failed" });
                                                    return;
                                                }

                                                resolve({
                                                    success: true,
                                                    data: { crewMemberId, productionHouseId, purchasePrice }
                                                });
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        });
    });
}
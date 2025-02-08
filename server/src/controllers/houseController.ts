 // server/src/controllers/houseController.ts
import { Request, Response } from 'express';
import db from '../config/database';

export class HouseController {
    async getHouseDetails(req: Request, res: Response) {
        const productionHouseId = req.params.id;
        
        db.get(
            "SELECT id, name, budget FROM production_houses WHERE id = ?",
            [productionHouseId],
            (err, productionHouse) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                if (!productionHouse) {
                    return res.status(404).json({ error: "Production house not found" });
                }

                db.all(
                    `SELECT cm.*, pc.purchase_price 
                     FROM crew_members cm
                     JOIN purchased_crew pc ON cm.id = pc.crew_member_id
                     WHERE pc.production_house_id = ?`,
                    [productionHouseId],
                    (err, purchasedCrew) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.json({
                            ...productionHouse,
                            purchased_crew: purchasedCrew
                        });
                    }
                );
            }
        );
    }

    async getLeaderboard(req: Request, res: Response) {
        db.all(
            `SELECT 
                ph.id,
                ph.name,
                ph.budget,
                COUNT(DISTINCT pc.crew_member_id) as crew_count,
                COUNT(DISTINCT CASE WHEN cm.category = 'Lead Actor' THEN cm.id END) as lead_actors,
                COUNT(DISTINCT CASE WHEN cm.category = 'Supporting Actor' THEN cm.id END) as supporting_actors,
                COUNT(DISTINCT CASE WHEN cm.category = 'Musician' THEN cm.id END) as musicians,
                COUNT(DISTINCT CASE WHEN cm.category = 'Director' THEN cm.id END) as directors,
                COUNT(DISTINCT CASE WHEN cm.category = 'Nepo Kid' THEN cm.id END) as nepo_kids,
                COUNT(DISTINCT CASE WHEN cm.category = 'Comedic Relief' THEN cm.id END) as comedic_relief,
                AVG(cm.rating) as average_rating
            FROM production_houses ph
            LEFT JOIN purchased_crew pc ON ph.id = pc.production_house_id
            LEFT JOIN crew_members cm ON pc.crew_member_id = cm.id
            GROUP BY ph.id
            ORDER BY average_rating DESC`,
            (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json(rows);
            }
        );
    }
}
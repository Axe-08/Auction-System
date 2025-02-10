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
        const query = `
            WITH RankedCrew AS (
                SELECT 
                    pc.production_house_id,
                    cm.category,
                    cm.rating,
                    ROW_NUMBER() OVER (
                        PARTITION BY pc.production_house_id, cm.category 
                        ORDER BY cm.rating DESC
                    ) as rank_in_category
                FROM purchased_crew pc
                JOIN crew_members cm ON pc.crew_member_id = cm.id
            )
            SELECT 
                ph.id,
                ph.name,
                ph.budget,
                COUNT(DISTINCT pc.crew_member_id) as crew_count,
                (
                    SELECT AVG(rating)
                    FROM (
                        SELECT rating FROM RankedCrew rc
                        WHERE rc.production_house_id = ph.id
                        AND rc.category = 'Lead Actor'
                        AND rc.rank_in_category <= 3
                        UNION ALL
                        SELECT rating FROM RankedCrew rc
                        WHERE rc.production_house_id = ph.id
                        AND rc.category = 'Supporting Actor'
                        AND rc.rank_in_category <= 2
                        UNION ALL
                        SELECT rating FROM RankedCrew rc
                        WHERE rc.production_house_id = ph.id
                        AND rc.category = 'Musician'
                        AND rc.rank_in_category <= 1
                        UNION ALL
                        SELECT rating FROM RankedCrew rc
                        WHERE rc.production_house_id = ph.id
                        AND rc.category = 'Director'
                        AND rc.rank_in_category <= 1
                        UNION ALL
                        SELECT rating FROM RankedCrew rc
                        WHERE rc.production_house_id = ph.id
                        AND rc.category = 'Nepo Kid'
                        AND rc.rank_in_category <= 1
                        UNION ALL
                        SELECT rating FROM RankedCrew rc
                        WHERE rc.production_house_id = ph.id
                        AND rc.category = 'Comedic Relief'
                        AND rc.rank_in_category <= 1
                    ) as required_crew
                ) as average_rating,
                SUM(CASE WHEN cm.category = 'Lead Actor' AND ranked.rank_in_category <= 3 THEN 1 ELSE 0 END) as lead_actors,
                SUM(CASE WHEN cm.category = 'Supporting Actor' AND ranked.rank_in_category <= 2 THEN 1 ELSE 0 END) as supporting_actors,
                SUM(CASE WHEN cm.category = 'Musician' AND ranked.rank_in_category <= 1 THEN 1 ELSE 0 END) as musicians,
                SUM(CASE WHEN cm.category = 'Director' AND ranked.rank_in_category <= 1 THEN 1 ELSE 0 END) as directors,
                SUM(CASE WHEN cm.category = 'Nepo Kid' AND ranked.rank_in_category <= 1 THEN 1 ELSE 0 END) as nepo_kids,
                SUM(CASE WHEN cm.category = 'Comedic Relief' AND ranked.rank_in_category <= 1 THEN 1 ELSE 0 END) as comedic_relief
            FROM production_houses ph
            LEFT JOIN purchased_crew pc ON ph.id = pc.production_house_id
            LEFT JOIN crew_members cm ON pc.crew_member_id = cm.id
            LEFT JOIN RankedCrew ranked ON ranked.production_house_id = ph.id 
                AND ranked.category = cm.category
            GROUP BY ph.id
            ORDER BY average_rating DESC NULLS LAST`;
    
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error getting leaderboard:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    }
}
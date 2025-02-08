// server/src/controllers/crewController.ts
import { Request, Response } from 'express';
import db from '../config/database';
import { processSaleTransaction } from '../services/saleService';

export class CrewController {
    async getAllCrew(req: Request, res: Response) {
        db.all(`
            SELECT 
                c.*,
                ph.name as buyer_name,
                ph.id as production_house_id
            FROM crew_members c
            LEFT JOIN purchased_crew pc ON c.id = pc.crew_member_id
            LEFT JOIN production_houses ph ON pc.production_house_id = ph.id
        `, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    }

    async getCrewMember(req: Request, res: Response) {
        db.get(
            "SELECT * FROM crew_members WHERE id = ?",
            [req.params.id],
            (err, row) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                if (!row) {
                    return res.status(404).json({ error: "Crew member not found" });
                }
                res.json(row);
            }
        );
    }

    async sellCrewMember(req: Request, res: Response) {
        const { crewMemberId, productionHouseId, purchasePrice } = req.body;
        
        try {
            const result = await processSaleTransaction(crewMemberId, productionHouseId, purchasePrice);
            if (result.success) {
                res.json({ success: true });
            } else {
                res.status(400).json({ success: false, error: result.error });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Transaction failed' });
        }
    }
}
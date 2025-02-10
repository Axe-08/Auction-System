// server/src/controllers/crewController.ts
import { Request, Response } from 'express';
import db from '../config/database';
import { processSaleTransaction } from '../services/saleService';
import { emitWithRetry } from '../services/socketService';

export class CrewController {
    async getAllCrew(req: Request, res: Response) {
        console.log('Getting all crew');
        db.all(`
            SELECT 
                c.*,
                ph.name as buyer_name,
                ph.id as production_house_id,
                pc.purchase_price
            FROM crew_members c
            LEFT JOIN purchased_crew pc ON c.id = pc.crew_member_id
            LEFT JOIN production_houses ph ON pc.production_house_id = ph.id
        `, (err, rows) => {
            if (err) {
                console.error('Error getting crew:', err);
                return res.status(500).json({ error: err.message });
            }
            console.log('Crew data retrieved:', rows);
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
                // Use emitWithRetry for more reliable socket communication
                const saleEmitted = await emitWithRetry('sale_complete', {
                    crewMemberId,
                    productionHouseId,
                    purchasePrice
                });
    
                const budgetEmitted = await emitWithRetry('house_budget_updated', {
                    houseId: productionHouseId,
                    budget: result.data?.newBudget
                });
    
                if (!saleEmitted || !budgetEmitted) {
                    console.warn('Some socket events failed to emit');
                }
    
                res.json({ success: true });
            } else {
                res.status(400).json({ success: false, error: result.error });
            }
        } catch (error) {
            console.error('Sale error:', error);
            res.status(500).json({ success: false, error: 'Transaction failed' });
        }
    }
}
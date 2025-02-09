// server/src/controllers/crewController.ts
import { Request, Response } from 'express';
import db from '../config/database';
import { processSaleTransaction } from '../services/saleService';
import { getIO } from '../services/socketService';

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
        console.log('Sale requested:', { crewMemberId, productionHouseId, purchasePrice });
        
        try {
            const result = await processSaleTransaction(crewMemberId, productionHouseId, purchasePrice);
            console.log('Sale transaction result:', result);
    
            if (result.success) {
                const io = getIO();
                console.log('Emitting sale_complete event:', {
                    crewMemberId,
                    productionHouseId,
                    purchasePrice
                });
                
                // Emit sale completion event
                io.emit('sale_complete', {
                    crewMemberId,
                    productionHouseId,
                    purchasePrice
                });
    
                console.log('Emitting house_budget_updated event:', {
                    houseId: productionHouseId,
                    budget: result.data?.newBudget
                });
    
                // Emit budget update
                io.emit('house_budget_updated', {
                    houseId: productionHouseId,
                    budget: result.data?.newBudget
                });
    
                res.json({ success: true });
            } else {
                console.log('Sale failed:', result.error);
                res.status(400).json({ success: false, error: result.error });
            }
        } catch (error) {
            console.error('Sale error:', error);
            res.status(500).json({ success: false, error: 'Transaction failed' });
        }
    }
}
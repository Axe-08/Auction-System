// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import db from '../config/database';

export class AuthController {
    async adminAuth(req: Request, res: Response): Promise<void> {
        try {
            const { accessCode } = req.body;
            
            if (accessCode === 'ADMIN_MASTER_123') {
                const token = Buffer.from(`ADMIN_${Date.now()}`).toString('base64');
                res.json({
                    success: true,
                    token
                });
            } else {
                res.status(401).json({
                    success: false,
                    error: 'Invalid admin code'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async adminVerify(req: Request, res: Response): Promise<void> {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    error: 'No token provided'
                });
                return;
            }

            const encodedToken = authHeader.split(' ')[1];
            const decodedToken = Buffer.from(encodedToken, 'base64').toString();
            
            if (decodedToken.startsWith('ADMIN_')) {
                res.json({ success: true });
            } else {
                res.status(401).json({
                    success: false,
                    error: 'Invalid token'
                });
            }
        } catch (error) {
            res.status(401).json({
                success: false,
                error: 'Invalid token format'
            });
        }
    }

    async houseAuth(req: Request, res: Response): Promise<void> {
        try {
            const { accessCode } = req.body;
            
            db.get(
                "SELECT id, name, budget FROM production_houses WHERE access_code = ?",
                [accessCode],
                (err, row) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    if (!row) {
                        res.status(401).json({ error: "Invalid access code" });
                        return;
                    }
                    res.json(row);
                }
            );
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
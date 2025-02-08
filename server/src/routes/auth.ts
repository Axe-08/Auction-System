// server/src/routes/auth.ts
import express, { Request, Response } from 'express';
import { AuthController } from '../controllers/authController';

const router = express.Router();
const authController = new AuthController();

// Convert async controller methods to middleware functions
router.post('/admin/auth', (req: Request, res: Response) => {
    authController.adminAuth(req, res)
        .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/admin/verify', (req: Request, res: Response) => {
    authController.adminVerify(req, res)
        .catch(err => res.status(500).json({ error: err.message }));
});

router.post('/auth', (req: Request, res: Response) => {
    authController.houseAuth(req, res)
        .catch(err => res.status(500).json({ error: err.message }));
});

export default router;
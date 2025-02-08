// server/src/routes/house.ts
import express from 'express';
import { HouseController } from '../controllers/houseController';

const router = express.Router();
const houseController = new HouseController();

router.get('/production-house/:id', houseController.getHouseDetails);
router.get('/leaderboard', houseController.getLeaderboard);

export default router;
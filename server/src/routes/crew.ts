// server/src/routes/crew.ts
import express from 'express';
import { CrewController } from '../controllers/crewController';

const router = express.Router();
const crewController = new CrewController();

router.get('/crew', crewController.getAllCrew);
router.get('/crew/:id', crewController.getCrewMember);
router.post('/sell', crewController.sellCrewMember);

export default router;
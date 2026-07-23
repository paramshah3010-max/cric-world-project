import { Router } from 'express';
import { getMatchSquads } from '../controllers/squad.controller.js';

const router = Router();

router.get('/matches/:matchId/squads', getMatchSquads);

export default router;

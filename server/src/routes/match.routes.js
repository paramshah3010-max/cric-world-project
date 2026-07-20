import { Router } from 'express';
import {
  getAllMatches,
  getLiveMatches,
  getUpcomingMatches,
  getCompletedMatches,
  getMatch,
} from '../controllers/match.controller.js';

const router = Router();

router.get('/', getAllMatches);
router.get('/live', getLiveMatches);
router.get('/upcoming', getUpcomingMatches);
router.get('/completed', getCompletedMatches);
router.get('/:id', getMatch);

export default router;

import { Router } from 'express';
import {
  getInningsForMatch,
  createInningsForMatch,
  getSingleInnings,
  patchInnings,
  getOvers,
  getSingleOver,
  createOverForInnings,
  patchOver,
  getBalls,
  getSingleBall,
  postBall,
} from '../controllers/innings.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ── Innings ─────────────────────────────────────────────────────────────────

router.get('/matches/:matchId/innings', getInningsForMatch);
router.post('/matches/:matchId/innings', requireAuth, createInningsForMatch);
router.get('/innings/:inningsId', getSingleInnings);
router.patch('/innings/:inningsId', requireAuth, patchInnings);

// ── Overs ───────────────────────────────────────────────────────────────────

router.get('/innings/:inningsId/overs', getOvers);
router.get('/overs/:overId', getSingleOver);
router.post('/innings/:inningsId/overs', requireAuth, createOverForInnings);
router.patch('/overs/:overId', requireAuth, patchOver);

// ── Balls ───────────────────────────────────────────────────────────────────

router.get('/overs/:overId/balls', getBalls);
router.get('/balls/:ballId', getSingleBall);
router.post('/overs/:overId/balls', requireAuth, postBall);

export default router;

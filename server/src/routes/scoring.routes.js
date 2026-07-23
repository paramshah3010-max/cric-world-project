import { Router } from 'express';
import {
  getMatchScorecard,
  getBattingScores,
  putBattingScore,
  getBowlingFigures,
  putBowlingFigure,
  getPartnerships,
  postPartnership,
  patchPartnership,
  getFallOfWickets,
  postFallOfWicket,
  getCommentary,
  postCommentary,
} from '../controllers/scoring.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ── Complete scorecard ──────────────────────────────────────────────────────

router.get('/matches/:matchId/scorecard', getMatchScorecard);

// ── Batting ─────────────────────────────────────────────────────────────────

router.get('/innings/:inningsId/batting', getBattingScores);
router.put('/innings/:inningsId/batting', requireAuth, putBattingScore);

// ── Bowling ─────────────────────────────────────────────────────────────────

router.get('/innings/:inningsId/bowling', getBowlingFigures);
router.put('/innings/:inningsId/bowling', requireAuth, putBowlingFigure);

// ── Partnerships ────────────────────────────────────────────────────────────

router.get('/innings/:inningsId/partnerships', getPartnerships);
router.post('/innings/:inningsId/partnerships', requireAuth, postPartnership);
router.patch('/partnerships/:partnershipId', requireAuth, patchPartnership);

// ── Fall of wickets ─────────────────────────────────────────────────────────

router.get('/innings/:inningsId/fow', getFallOfWickets);
router.post('/innings/:inningsId/fow', requireAuth, postFallOfWicket);

// ── Commentary ──────────────────────────────────────────────────────────────

router.get('/matches/:matchId/commentary', getCommentary);
router.post('/matches/:matchId/commentary', requireAuth, postCommentary);

export default router;

import { Router } from 'express';
import matchRoutes from './match.routes.js';
import authRoutes from './auth.routes.js';
import inningsRoutes from './innings.routes.js';
import scoringRoutes from './scoring.routes.js';
import squadRoutes from './squad.routes.js';

const router = Router();

// Health check — used to verify the API is reachable.
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cric-world-api', time: new Date().toISOString() });
});

router.use('/matches', matchRoutes);
router.use('/auth', authRoutes);
router.use('/', inningsRoutes);
router.use('/', scoringRoutes);
router.use('/', squadRoutes);

export default router;

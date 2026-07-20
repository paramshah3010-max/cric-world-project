import { Router } from 'express';
import matchRoutes from './match.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

// Health check — used to verify the API is reachable.
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cric-world-api', time: new Date().toISOString() });
});

router.use('/matches', matchRoutes);
router.use('/auth', authRoutes);

export default router;

import { asyncHandler } from '../utils/asyncHandler.js';
import { getSquads } from '../services/squad.service.js';

export const getMatchSquads = asyncHandler(async (req, res) => {
  const data = await getSquads(req.params.matchId);
  res.json({ data });
});

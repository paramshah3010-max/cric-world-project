import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {
  listInnings,
  getInnings,
  createInnings,
  updateInnings,
  listOvers,
  getOver,
  createOver,
  updateOver,
  listBalls,
  getBall,
  recordBall,
} from '../services/innings.service.js';

// ── Match → Innings ────────────────────────────────────────────────────────

export const getInningsForMatch = asyncHandler(async (req, res) => {
  const data = await listInnings(req.params.matchId);
  res.json({ data });
});

export const createInningsForMatch = asyncHandler(async (req, res) => {
  const data = await createInnings(req.params.matchId, req.body);
  res.status(201).json({ data });
});

// ── Single Innings ──────────────────────────────────────────────────────────

export const getSingleInnings = asyncHandler(async (req, res) => {
  const data = await getInnings(req.params.inningsId);
  res.json({ data });
});

export const patchInnings = asyncHandler(async (req, res) => {
  const data = await updateInnings(req.params.inningsId, req.body);
  res.json({ data });
});

// ── Overs ───────────────────────────────────────────────────────────────────

export const getOvers = asyncHandler(async (req, res) => {
  const data = await listOvers(req.params.inningsId);
  res.json({ data });
});

export const getSingleOver = asyncHandler(async (req, res) => {
  const data = await getOver(req.params.overId);
  res.json({ data });
});

export const createOverForInnings = asyncHandler(async (req, res) => {
  const data = await createOver(req.params.inningsId, req.body);
  res.status(201).json({ data });
});

export const patchOver = asyncHandler(async (req, res) => {
  const data = await updateOver(req.params.overId, req.body);
  res.json({ data });
});

// ── Balls ───────────────────────────────────────────────────────────────────

export const getBalls = asyncHandler(async (req, res) => {
  const data = await listBalls(req.params.overId);
  res.json({ data });
});

export const getSingleBall = asyncHandler(async (req, res) => {
  const data = await getBall(req.params.ballId);
  res.json({ data });
});

export const postBall = asyncHandler(async (req, res) => {
  const data = await recordBall(req.params.overId, req.body);
  res.status(201).json({ data });
});

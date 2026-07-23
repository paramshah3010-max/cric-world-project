import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {
  getScorecard,
  listBattingScores,
  upsertBattingScore,
  listBowlingFigures,
  upsertBowlingFigure,
  listPartnerships,
  createPartnership,
  updatePartnership,
  listFallOfWickets,
  createFallOfWicket,
  listCommentary,
  createCommentary,
} from '../services/scoring.service.js';

// ── Complete Scorecard ──────────────────────────────────────────────────────

export const getMatchScorecard = asyncHandler(async (req, res) => {
  const data = await getScorecard(req.params.matchId);
  res.json({ data });
});

// ── Batting ─────────────────────────────────────────────────────────────────

export const getBattingScores = asyncHandler(async (req, res) => {
  const data = await listBattingScores(req.params.inningsId);
  res.json({ data });
});

export const putBattingScore = asyncHandler(async (req, res) => {
  const { playerId, ...rest } = req.body;
  if (!playerId) throw ApiError.badRequest('playerId is required');
  const data = await upsertBattingScore(req.params.inningsId, playerId, rest);
  res.json({ data });
});

// ── Bowling ─────────────────────────────────────────────────────────────────

export const getBowlingFigures = asyncHandler(async (req, res) => {
  const data = await listBowlingFigures(req.params.inningsId);
  res.json({ data });
});

export const putBowlingFigure = asyncHandler(async (req, res) => {
  const { playerId, ...rest } = req.body;
  if (!playerId) throw ApiError.badRequest('playerId is required');
  const data = await upsertBowlingFigure(req.params.inningsId, playerId, rest);
  res.json({ data });
});

// ── Partnerships ────────────────────────────────────────────────────────────

export const getPartnerships = asyncHandler(async (req, res) => {
  const data = await listPartnerships(req.params.inningsId);
  res.json({ data });
});

export const postPartnership = asyncHandler(async (req, res) => {
  const data = await createPartnership(req.params.inningsId, req.body);
  res.status(201).json({ data });
});

export const patchPartnership = asyncHandler(async (req, res) => {
  const data = await updatePartnership(req.params.partnershipId, req.body);
  res.json({ data });
});

// ── Fall of Wickets ─────────────────────────────────────────────────────────

export const getFallOfWickets = asyncHandler(async (req, res) => {
  const data = await listFallOfWickets(req.params.inningsId);
  res.json({ data });
});

export const postFallOfWicket = asyncHandler(async (req, res) => {
  const data = await createFallOfWicket(req.params.inningsId, req.body);
  res.status(201).json({ data });
});

// ── Commentary ──────────────────────────────────────────────────────────────

export const getCommentary = asyncHandler(async (req, res) => {
  const inningsId = req.query.inningsId || undefined;
  const limit = parseInt(req.query.limit, 10) || 50;
  const data = await listCommentary(req.params.matchId, { inningsId, limit });
  res.json({ data });
});

export const postCommentary = asyncHandler(async (req, res) => {
  const data = await createCommentary(req.params.matchId, req.body);
  res.status(201).json({ data });
});

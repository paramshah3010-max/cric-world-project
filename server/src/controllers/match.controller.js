import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { listMatches, getMatchById } from '../services/match.service.js';

export const getAllMatches = asyncHandler(async (req, res) => {
  const data = await listMatches();
  res.json({ data });
});

export const getLiveMatches = asyncHandler(async (req, res) => {
  const data = await listMatches('LIVE');
  res.json({ data });
});

export const getUpcomingMatches = asyncHandler(async (req, res) => {
  const data = await listMatches('UPCOMING');
  res.json({ data });
});

export const getCompletedMatches = asyncHandler(async (req, res) => {
  const data = await listMatches('COMPLETED');
  res.json({ data });
});

export const getMatch = asyncHandler(async (req, res) => {
  const match = await getMatchById(req.params.id);
  if (!match) throw ApiError.notFound('Match not found');
  res.json({ data: match });
});

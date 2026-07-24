import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

// ---------------------------------------------------------------------------
// Shared selects
// ---------------------------------------------------------------------------

const battingScoreSelect = {
  id: true,
  inningsId: true,
  playerId: true,
  player: { select: { id: true, name: true, country: true } },
  battingPosition: true,
  runs: true,
  ballsFaced: true,
  fours: true,
  sixes: true,
  strikeRate: true,
  dismissalType: true,
  dismissedBy: true,
  fielderName: true,
  isNotOut: true,
};

const bowlingFigureSelect = {
  id: true,
  inningsId: true,
  playerId: true,
  player: { select: { id: true, name: true } },
  overs: true,
  ballsBowled: true,
  maidens: true,
  runsConceded: true,
  wickets: true,
  economy: true,
  widesBowled: true,
  noBallsBowled: true,
};

const partnershipSelect = {
  id: true,
  inningsId: true,
  batter1Id: true,
  batter1: { select: { id: true, name: true } },
  batter2Id: true,
  batter2: { select: { id: true, name: true } },
  runs: true,
  ballsFaced: true,
  wicketNumber: true,
  startOver: true,
  endOver: true,
};

const fallOfWicketSelect = {
  id: true,
  inningsId: true,
  wicketNumber: true,
  playerId: true,
  player: { select: { id: true, name: true } },
  teamScore: true,
  overNumber: true,
};

const commentarySelect = {
  id: true,
  matchId: true,
  inningsId: true,
  overId: true,
  ballId: true,
  overLabel: true,
  text: true,
  eventType: true,
  timestamp: true,
};

// ---------------------------------------------------------------------------
// Batting Scores — Read
// ---------------------------------------------------------------------------

export async function listBattingScores(inningsId) {
  const innings = await prisma.innings.findUnique({ where: { id: inningsId } });
  if (!innings) throw ApiError.notFound('Innings not found');

  return prisma.battingScore.findMany({
    where: { inningsId },
    select: battingScoreSelect,
    orderBy: { battingPosition: 'asc' },
  });
}

// ---------------------------------------------------------------------------
// Batting Scores — Write
// ---------------------------------------------------------------------------

export async function upsertBattingScore(inningsId, playerId, data) {
  const innings = await prisma.innings.findUnique({ where: { id: inningsId } });
  if (!innings) throw ApiError.notFound('Innings not found');

  const existing = await prisma.battingScore.findUnique({
    where: { inningsId_playerId: { inningsId, playerId } },
  });

  if (existing) {
    return prisma.battingScore.update({
      where: { inningsId_playerId: { inningsId, playerId } },
      data,
      select: battingScoreSelect,
    });
  }

  // Ensure battingPosition is provided for new records.
  if (!data.battingPosition) {
    data.battingPosition = await prisma.battingScore.count({ where: { inningsId } }) + 1;
  }

  return prisma.battingScore.create({
    data: { inningsId, playerId, ...data },
    select: battingScoreSelect,
  });
}

// ---------------------------------------------------------------------------
// Bowling Figures — Read
// ---------------------------------------------------------------------------

export async function listBowlingFigures(inningsId) {
  const innings = await prisma.innings.findUnique({ where: { id: inningsId } });
  if (!innings) throw ApiError.notFound('Innings not found');

  return prisma.bowlingFigure.findMany({
    where: { inningsId },
    select: bowlingFigureSelect,
    orderBy: { createdAt: 'asc' },
  });
}

// ---------------------------------------------------------------------------
// Bowling Figures — Write
// ---------------------------------------------------------------------------

export async function upsertBowlingFigure(inningsId, playerId, data) {
  const innings = await prisma.innings.findUnique({ where: { id: inningsId } });
  if (!innings) throw ApiError.notFound('Innings not found');

  const existing = await prisma.bowlingFigure.findUnique({
    where: { inningsId_playerId: { inningsId, playerId } },
  });

  if (existing) {
    return prisma.bowlingFigure.update({
      where: { inningsId_playerId: { inningsId, playerId } },
      data,
      select: bowlingFigureSelect,
    });
  }

  return prisma.bowlingFigure.create({
    data: { inningsId, playerId, ...data },
    select: bowlingFigureSelect,
  });
}

// ---------------------------------------------------------------------------
// Partnerships — Read
// ---------------------------------------------------------------------------

export async function listPartnerships(inningsId) {
  const innings = await prisma.innings.findUnique({ where: { id: inningsId } });
  if (!innings) throw ApiError.notFound('Innings not found');

  return prisma.partnership.findMany({
    where: { inningsId },
    select: partnershipSelect,
    orderBy: { createdAt: 'asc' },
  });
}

// ---------------------------------------------------------------------------
// Partnerships — Write
// ---------------------------------------------------------------------------

export async function createPartnership(inningsId, { batter1Id, batter2Id, runs, ballsFaced, wicketNumber, startOver, endOver }) {
  const innings = await prisma.innings.findUnique({ where: { id: inningsId } });
  if (!innings) throw ApiError.notFound('Innings not found');

  if (!batter1Id || !batter2Id) {
    throw ApiError.badRequest('batter1Id and batter2Id are required');
  }

  return prisma.partnership.create({
    data: { inningsId, batter1Id, batter2Id, runs: runs ?? 0, ballsFaced: ballsFaced ?? 0, wicketNumber: wicketNumber ?? null, startOver: startOver ?? null, endOver: endOver ?? null },
    select: partnershipSelect,
  });
}

export async function updatePartnership(partnershipId, data) {
  const existing = await prisma.partnership.findUnique({ where: { id: partnershipId } });
  if (!existing) throw ApiError.notFound('Partnership not found');

  return prisma.partnership.update({
    where: { id: partnershipId },
    data,
    select: partnershipSelect,
  });
}

// ---------------------------------------------------------------------------
// Fall of Wickets — Read
// ---------------------------------------------------------------------------

export async function listFallOfWickets(inningsId) {
  const innings = await prisma.innings.findUnique({ where: { id: inningsId } });
  if (!innings) throw ApiError.notFound('Innings not found');

  return prisma.fallOfWicket.findMany({
    where: { inningsId },
    select: fallOfWicketSelect,
    orderBy: { wicketNumber: 'asc' },
  });
}

// ---------------------------------------------------------------------------
// Fall of Wickets — Write
// ---------------------------------------------------------------------------

export async function createFallOfWicket(inningsId, { wicketNumber, playerId, teamScore, overNumber }) {
  const innings = await prisma.innings.findUnique({ where: { id: inningsId } });
  if (!innings) throw ApiError.notFound('Innings not found');

  if (!wicketNumber || !playerId) {
    throw ApiError.badRequest('wicketNumber and playerId are required');
  }

  return prisma.fallOfWicket.create({
    data: { inningsId, wicketNumber, playerId, teamScore: teamScore ?? 0, overNumber: overNumber ?? 0 },
    select: fallOfWicketSelect,
  });
}

// ---------------------------------------------------------------------------
// Commentary — Read
// ---------------------------------------------------------------------------

export async function listCommentary(matchId, { inningsId, limit = 50 }) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw ApiError.notFound('Match not found');

  const where = { matchId };
  if (inningsId) where.inningsId = inningsId;

  return prisma.commentary.findMany({
    where,
    select: commentarySelect,
    orderBy: { timestamp: 'desc' },
    take: Math.min(limit, 200),
  });
}

// ---------------------------------------------------------------------------
// Commentary — Write
// ---------------------------------------------------------------------------

export async function createCommentary(matchId, { inningsId, overId, ballId, overLabel, text, eventType }) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw ApiError.notFound('Match not found');

  if (!text) throw ApiError.badRequest('text is required');

  return prisma.commentary.create({
    data: {
      matchId,
      inningsId: inningsId ?? null,
      overId: overId ?? null,
      ballId: ballId ?? null,
      overLabel: overLabel ?? null,
      text,
      eventType: eventType ?? 'MATCH_EVENT',
    },
    select: commentarySelect,
  });
}

// ---------------------------------------------------------------------------
// Complete Scorecard
// ---------------------------------------------------------------------------

export async function getScorecard(matchId) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      tournament: { select: { id: true, name: true, shortName: true } },
      venue: { select: { id: true, name: true, city: true, country: true } },
      homeTeam: { select: { id: true, name: true, shortName: true, logoText: true, primary: true } },
      awayTeam: { select: { id: true, name: true, shortName: true, logoText: true, primary: true } },
    },
  });
  if (!match) throw ApiError.notFound('Match not found');

  const inningsList = await prisma.innings.findMany({
    where: { matchId },
    include: {
      battingTeam: { select: { id: true, name: true, shortName: true, logoText: true, primary: true } },
      bowlingTeam: { select: { id: true, name: true, shortName: true, logoText: true, primary: true } },
    },
    orderBy: { inningsNumber: 'asc' },
  });

  const inningsData = [];
  for (const inn of inningsList) {
    const [batting, bowling, fow, partnerships] = await Promise.all([
      prisma.battingScore.findMany({ where: { inningsId: inn.id }, select: battingScoreSelect, orderBy: { battingPosition: 'asc' } }),
      prisma.bowlingFigure.findMany({ where: { inningsId: inn.id }, select: bowlingFigureSelect, orderBy: { createdAt: 'asc' } }),
      prisma.fallOfWicket.findMany({ where: { inningsId: inn.id }, select: fallOfWicketSelect, orderBy: { wicketNumber: 'asc' } }),
      prisma.partnership.findMany({ where: { inningsId: inn.id }, select: partnershipSelect, orderBy: { createdAt: 'asc' } }),
    ]);

    inningsData.push({
      ...inn,
      battingScorecard: batting,
      bowlingScorecard: bowling,
      fallOfWickets: fow,
      partnerships,
    });
  }

  return {
    id: match.id,
    name: match.name,
    format: match.format,
    status: match.status,
    startTime: match.startTime,
    result: match.result,
    tournament: match.tournament,
    venue: match.venue,
    toss: match.tossWinner ? { winner: match.tossWinner, decision: match.tossDecision } : null,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    innings: inningsData,
  };
}

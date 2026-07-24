import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

// ---------------------------------------------------------------------------
// Shared Prisma includes
// ---------------------------------------------------------------------------

const inningsInclude = {
  match: { select: { id: true, name: true, format: true, status: true } },
  battingTeam: { select: { id: true, name: true, shortName: true, logoText: true, primary: true } },
  bowlingTeam: { select: { id: true, name: true, shortName: true, logoText: true, primary: true } },
};

const overInclude = {
  innings: { select: { id: true, inningsNumber: true, matchId: true } },
};

const ballInclude = {
  striker: { select: { id: true, name: true } },
  nonStriker: { select: { id: true, name: true } },
  bowler: { select: { id: true, name: true } },
  dismissedPlayer: { select: { id: true, name: true } },
  fielder: { select: { id: true, name: true } },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert total legal balls to cricket overs display format.
 * e.g. 93 balls → 15.3 (15 overs + 3 balls)
 */
function ballsToOvers(legalBalls) {
  const completed = Math.floor(legalBalls / 6);
  const remaining = legalBalls % 6;
  return Math.round((completed + remaining / 10) * 100) / 100;
}

/**
 * Convert ballsBowled to a mathematical float for economy rate.
 * e.g. 25 balls → 25 / 6 ≈ 4.1667
 */
function ballsToMathOvers(ballsBowled) {
  return ballsBowled / 6;
}

// ---------------------------------------------------------------------------
// Innings — Read
// ---------------------------------------------------------------------------

export async function listInnings(matchId) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw ApiError.notFound('Match not found');

  return prisma.innings.findMany({
    where: { matchId },
    include: inningsInclude,
    orderBy: { inningsNumber: 'asc' },
  });
}

export async function getInnings(inningsId) {
  const innings = await prisma.innings.findUnique({
    where: { id: inningsId },
    include: inningsInclude,
  });
  if (!innings) throw ApiError.notFound('Innings not found');
  return innings;
}

// ---------------------------------------------------------------------------
// Innings — Write
// ---------------------------------------------------------------------------

export async function createInnings(matchId, { inningsNumber, battingTeamId, bowlingTeamId }) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw ApiError.notFound('Match not found');

  // Validate innings number: a T20/ODI can have at most 2; Test up to 4.
  const maxInnings = match.format === 'TEST' ? 4 : 2;
  if (inningsNumber < 1 || inningsNumber > maxInnings) {
    throw ApiError.badRequest(
      `Innings number must be between 1 and ${maxInnings} for ${match.format} format`
    );
  }

  // Ensure this innings number isn't already taken.
  const existing = await prisma.innings.findUnique({
    where: { matchId_inningsNumber: { matchId, inningsNumber } },
  });
  if (existing) {
    throw ApiError.badRequest(`Innings ${inningsNumber} already exists for this match`);
  }

  const innings = await prisma.innings.create({
    data: {
      inningsNumber,
      matchId,
      battingTeamId,
      bowlingTeamId,
      status: 'IN_PROGRESS',
    },
    include: inningsInclude,
  });

  return innings;
}

export async function updateInnings(inningsId, updates) {
  const existing = await prisma.innings.findUnique({ where: { id: inningsId } });
  if (!existing) throw ApiError.notFound('Innings not found');

  const data = {};
  if (updates.status !== undefined) data.status = updates.status;
  if (updates.totalRuns !== undefined) data.totalRuns = updates.totalRuns;
  if (updates.totalWickets !== undefined) data.totalWickets = updates.totalWickets;
  if (updates.totalOvers !== undefined) data.totalOvers = updates.totalOvers;

  return prisma.innings.update({
    where: { id: inningsId },
    data,
    include: inningsInclude,
  });
}

// ---------------------------------------------------------------------------
// Overs — Read
// ---------------------------------------------------------------------------

export async function listOvers(inningsId) {
  const innings = await prisma.innings.findUnique({ where: { id: inningsId } });
  if (!innings) throw ApiError.notFound('Innings not found');

  return prisma.over.findMany({
    where: { inningsId },
    orderBy: { overNumber: 'asc' },
  });
}

export async function getOver(overId) {
  const over = await prisma.over.findUnique({
    where: { id: overId },
    include: overInclude,
  });
  if (!over) throw ApiError.notFound('Over not found');
  return over;
}

// ---------------------------------------------------------------------------
// Overs — Write
// ---------------------------------------------------------------------------

export async function createOver(inningsId, { overNumber }) {
  const innings = await prisma.innings.findUnique({ where: { id: inningsId } });
  if (!innings) throw ApiError.notFound('Innings not found');

  if (innings.status !== 'IN_PROGRESS') {
    throw ApiError.badRequest('Cannot add overs to a completed innings');
  }

  const existing = await prisma.over.findUnique({
    where: { inningsId_overNumber: { inningsId, overNumber } },
  });
  if (existing) {
    throw ApiError.badRequest(`Over ${overNumber} already exists in this innings`);
  }

  return prisma.over.create({
    data: { inningsId, overNumber },
  });
}

export async function updateOver(overId, updates) {
  const existing = await prisma.over.findUnique({ where: { id: overId } });
  if (!existing) throw ApiError.notFound('Over not found');

  const data = {};
  if (updates.status !== undefined) data.status = updates.status;
  if (updates.maiden !== undefined) data.maiden = updates.maiden;

  return prisma.over.update({ where: { id: overId }, data });
}

// ---------------------------------------------------------------------------
// Balls — Read
// ---------------------------------------------------------------------------

export async function listBalls(overId) {
  const over = await prisma.over.findUnique({ where: { id: overId } });
  if (!over) throw ApiError.notFound('Over not found');

  return prisma.ball.findMany({
    where: { overId },
    include: ballInclude,
    orderBy: { ballNumber: 'asc' },
  });
}

export async function getBall(ballId) {
  const ball = await prisma.ball.findUnique({
    where: { id: ballId },
    include: ballInclude,
  });
  if (!ball) throw ApiError.notFound('Ball not found');
  return ball;
}

// ---------------------------------------------------------------------------
// Balls — Write (the core of live scoring)
// ---------------------------------------------------------------------------

/**
 * Record a single ball delivery. This is the atomic scoring operation.
 *
 * The client sends the raw ball data; the server calculates:
 *   - ballNumber        (sequential within over, including wides/no-balls)
 *   - legalBallNumber   (null for wides/no-balls; 1–6 for legal deliveries)
 *   - totalRuns         (batsmanRuns + extras)
 *   - All cascading aggregate updates (Over, Innings, BattingScore,
 *     BowlingFigure, FallOfWicket, Partnership).
 *
 * Cricket rules encoded:
 *   - WIDE / NO_BALL → legalBallNumber = null, do NOT increment legalBallCount.
 *   - WIDE: batsmanRuns always 0.
 *   - NO_BALL: batsmanRuns can be > 0 (runs off the bat), extras >= 1.
 *   - BYES / LEG_BYES: batsmanRuns = 0; extras do NOT count against the bowler.
 *   - Over completes when legalBallCount reaches 6.
 */
export async function recordBall(overId, body) {
  const {
    deliveryType,
    batsmanRuns = 0,
    extras = 0,
    extrasType,
    strikerId,
    nonStrikerId,
    bowlerId,
    isWicket = false,
    dismissalType,
    dismissedPlayerId,
    fielderId,
    commentaryText,
  } = body;

  // --- Validation ----------------------------------------------------------
  if (!deliveryType || !['LEGAL', 'WIDE', 'NO_BALL'].includes(deliveryType)) {
    throw ApiError.badRequest('deliveryType must be LEGAL, WIDE, or NO_BALL');
  }

  const over = await prisma.over.findUnique({
    where: { id: overId },
    include: { innings: true },
  });
  if (!over) throw ApiError.notFound('Over not found');
  if (over.status === 'COMPLETED') throw ApiError.badRequest('Over is already completed');

  if (!strikerId || !nonStrikerId || !bowlerId) {
    throw ApiError.badRequest('strikerId, nonStrikerId, and bowlerId are required');
  }

  // Enforce: WIDE → batsmanRuns must be 0 (the 1-run penalty is in extras).
  if (deliveryType === 'WIDE' && batsmanRuns > 0) {
    throw ApiError.badRequest('batsmanRuns must be 0 on a wide');
  }

  // Enforce: extrasType must match deliveryType when extras > 0.
  if (deliveryType === 'WIDE' && extrasType !== 'wide') {
    throw ApiError.badRequest('extrasType must be "wide" on a WIDE delivery');
  }
  if (deliveryType === 'NO_BALL' && extrasType !== 'no-ball') {
    throw ApiError.badRequest('extrasType must be "no-ball" on a NO_BALL delivery');
  }

  // Wicket validation.
  if (isWicket && (!dismissalType || !dismissedPlayerId)) {
    throw ApiError.badRequest('dismissalType and dismissedPlayerId are required for a wicket');
  }

  // --- Ball numbers --------------------------------------------------------
  const lastBall = await prisma.ball.findFirst({
    where: { overId },
    orderBy: { ballNumber: 'desc' },
  });
  const ballNumber = (lastBall?.ballNumber ?? 0) + 1;

  let legalBallNumber = null;
  if (deliveryType === 'LEGAL') {
    legalBallNumber = over.legalBallCount + 1;
  }

  const totalRuns = batsmanRuns + (extras ?? 0);

  // --- Create the ball -----------------------------------------------------
  const ball = await prisma.ball.create({
    data: {
      overId,
      ballNumber,
      legalBallNumber,
      strikerId,
      nonStrikerId,
      bowlerId,
      deliveryType,
      batsmanRuns: batsmanRuns || 0,
      extras: extras || 0,
      extrasType: extrasType || null,
      totalRuns,
      isWicket: isWicket || false,
      dismissalType: dismissalType || null,
      dismissedPlayerId: dismissedPlayerId || null,
      fielderId: fielderId || null,
      commentaryText: commentaryText || null,
    },
  });

  // --- Update Over ---------------------------------------------------------
  const isLegalDelivery = deliveryType === 'LEGAL';
  const newLegalBallCount = over.legalBallCount + (isLegalDelivery ? 1 : 0);

  // Bowler is not charged for byes or leg-byes.
  const isBowlerExempt = extrasType === 'bye' || extrasType === 'leg-bye';
  const bowlerRunsAdd = isBowlerExempt ? 0 : totalRuns;
  const newBowlerRuns = over.bowlerRuns + bowlerRunsAdd;
  const newTotalRuns = over.totalRuns + totalRuns;
  const newWickets = over.wickets + (isWicket ? 1 : 0);

  const isOverComplete = isLegalDelivery && newLegalBallCount >= 6;
  const isMaiden = isOverComplete && newBowlerRuns === 0 && newLegalBallCount === 6;

  await prisma.over.update({
    where: { id: overId },
    data: {
      legalBallCount: newLegalBallCount,
      totalRuns: newTotalRuns,
      bowlerRuns: newBowlerRuns,
      wickets: newWickets,
      maiden: isMaiden ? 1 : 0,
      status: isOverComplete ? 'COMPLETED' : 'IN_PROGRESS',
    },
  });

  // --- Update Innings ------------------------------------------------------
  const inningsId = over.inningsId;

  // Recalculate totalOvers from all overs in the innings.
  const allOvers = await prisma.over.findMany({
    where: { inningsId },
    select: { legalBallCount: true },
  });
  let totalLegalBalls = 0;
  for (const o of allOvers) totalLegalBalls += o.legalBallCount;
  const totalOvers = ballsToOvers(totalLegalBalls);

  const extrasIncrements = {};
  if (extrasType === 'wide') extrasIncrements.wides = extras + (extrasIncrements.wides || 0);
  if (extrasType === 'no-ball') extrasIncrements.noBalls = extras + (extrasIncrements.noBalls || 0);
  if (extrasType === 'bye') extrasIncrements.byes = extras + (extrasIncrements.byes || 0);
  if (extrasType === 'leg-bye') extrasIncrements.legByes = extras + (extrasIncrements.legByes || 0);
  if (extrasType === 'penalty') extrasIncrements.penalties = extras + (extrasIncrements.penalties || 0);

  await prisma.innings.update({
    where: { id: inningsId },
    data: {
      totalRuns: { increment: totalRuns },
      totalExtras: { increment: extras || 0 },
      totalOvers,
      totalWickets: isWicket ? { increment: 1 } : undefined,
      ...extrasIncrements,
      status: over.innings.status !== 'YET_TO_BAT' ? over.innings.status : 'IN_PROGRESS',
    },
  });

  // --- Update BattingScore (striker) --------------------------------------
  const batterFaced = deliveryType === 'LEGAL' || deliveryType === 'NO_BALL';
  const fours = (batsmanRuns || 0) === 4 ? 1 : 0;
  const sixes = (batsmanRuns || 0) === 6 ? 1 : 0;

  const bsKey = { inningsId_playerId: { inningsId, playerId: strikerId } };
  const battingScore = await prisma.battingScore.findUnique({ where: bsKey });
  if (battingScore) {
    const newBallsFaced = battingScore.ballsFaced + (batterFaced ? 1 : 0);
    const newRuns = battingScore.runs + (batsmanRuns || 0);
    const newStrikeRate = newBallsFaced > 0 ? parseFloat(((newRuns / newBallsFaced) * 100).toFixed(2)) : 0;
    await prisma.battingScore.update({
      where: bsKey,
      data: { runs: newRuns, ballsFaced: newBallsFaced, fours: { increment: fours }, sixes: { increment: sixes }, strikeRate: newStrikeRate },
    });
  } else {
    // Auto-create batting score if it doesn't exist yet (first ball faced).
    const nextPos = await prisma.battingScore.count({ where: { inningsId } }) + 1;
    await prisma.battingScore.create({
      data: {
        inningsId,
        playerId: strikerId,
        battingPosition: nextPos,
        runs: batsmanRuns || 0,
        ballsFaced: batterFaced ? 1 : 0,
        fours,
        sixes,
        strikeRate: batterFaced ? ((batsmanRuns || 0) / 1) * 100 : 0,
      },
    });
  }

  // --- Update BowlingFigure (bowler) ---------------------------------------
  const bfKey = { inningsId_playerId: { inningsId, playerId: bowlerId } };
  const bowlingFigure = await prisma.bowlingFigure.findUnique({ where: bfKey });
  if (bowlingFigure) {
    const newBallsBowled = bowlingFigure.ballsBowled + 1;
    const newRunsConceded = bowlingFigure.runsConceded + bowlerRunsAdd;
    const newBfWickets = bowlingFigure.wickets + (isWicket ? 1 : 0);
    const newEconomy = newBallsBowled > 0 ? parseFloat((newRunsConceded / ballsToMathOvers(newBallsBowled)).toFixed(2)) : 0;
    const newOvers = ballsToOvers(newBallsBowled);
    await prisma.bowlingFigure.update({
      where: bfKey,
      data: {
        overs: newOvers,
        ballsBowled: newBallsBowled,
        runsConceded: newRunsConceded,
        wickets: newBfWickets,
        economy: newEconomy,
        widesBowled: extrasType === 'wide' ? { increment: 1 } : undefined,
        noBallsBowled: extrasType === 'no-ball' ? { increment: 1 } : undefined,
      },
    });
  } else {
    // Auto-create bowling figure if it doesn't exist yet (first ball bowled).
    await prisma.bowlingFigure.create({
      data: {
        inningsId,
        playerId: bowlerId,
        overs: 0.1,
        ballsBowled: 1,
        runsConceded: bowlerRunsAdd,
        wickets: isWicket ? 1 : 0,
        economy: parseFloat((bowlerRunsAdd / ballsToMathOvers(1)).toFixed(2)),
        widesBowled: extrasType === 'wide' ? 1 : 0,
        noBallsBowled: extrasType === 'no-ball' ? 1 : 0,
      },
    });
  }

  // --- Handle wicket -------------------------------------------------------
  let fallOfWicket = null;
  if (isWicket && dismissedPlayerId) {
    // Update dismissed player's batting score.
    const dismissedBs = await prisma.battingScore.findUnique({
      where: { inningsId_playerId: { inningsId, playerId: dismissedPlayerId } },
    });
    if (dismissedBs) {
      const bowlerName = (await prisma.player.findUnique({ where: { id: bowlerId }, select: { name: true } }))?.name ?? null;
      await prisma.battingScore.update({
        where: { inningsId_playerId: { inningsId, playerId: dismissedPlayerId } },
        data: { isNotOut: false, dismissalType: dismissalType || null, dismissedBy: bowlerName },
      });
    }

    // Fetch updated innings for current totals.
    const innings = await prisma.innings.findUnique({ where: { id: inningsId }, select: { totalWickets: true, totalRuns: true } });

    // Create FOW.
    fallOfWicket = await prisma.fallOfWicket.create({
      data: {
        inningsId,
        wicketNumber: innings.totalWickets,
        playerId: dismissedPlayerId,
        teamScore: innings.totalRuns,
        overNumber: totalOvers,
      },
    });

    // End active partnership.
    await prisma.partnership.updateMany({
      where: { inningsId, wicketNumber: null },
      data: { wicketNumber: innings.totalWickets, endOver: totalOvers },
    });

    // Start new partnership with current not-out batters.
    const active = await prisma.battingScore.findMany({
      where: { inningsId, isNotOut: true },
      orderBy: { battingPosition: 'asc' },
      take: 2,
      select: { playerId: true },
    });
    if (active.length >= 2) {
      await prisma.partnership.create({
        data: { inningsId, batter1Id: active[0].playerId, batter2Id: active[1].playerId, startOver: totalOvers },
      });
    }
  }

  // --- Add auto commentary -------------------------------------------------
  if (!commentaryText) {
    await prisma.commentary.create({
      data: {
        matchId: over.innings.matchId,
        inningsId,
        overId,
        ballId: ball.id,
        overLabel: `Over ${over.overNumber}.${ballNumber}`,
        text: autoCommentary(ball),
        eventType: 'DELIVERY',
        timestamp: ball.createdAt,
      },
    });
  } else {
    await prisma.commentary.create({
      data: {
        matchId: over.innings.matchId,
        inningsId,
        overId,
        ballId: ball.id,
        overLabel: `Over ${over.overNumber}`,
        text: commentaryText,
        eventType: isWicket ? 'WICKET' : 'DELIVERY',
        timestamp: ball.createdAt,
      },
    });
  }

  // If over completed, add an END_OF_OVER commentary event.
  if (isOverComplete) {
    await prisma.commentary.create({
      data: {
        matchId: over.innings.matchId,
        inningsId,
        overId,
        overLabel: `Over ${over.overNumber}`,
        text: `End of over ${over.overNumber} — ${newTotalRuns} runs, ${newWickets} wicket${newWickets !== 1 ? 's' : ''}.`,
        eventType: 'END_OF_OVER',
      },
    });
  }

  return ball;
}

function autoCommentary(ball) {
  if (ball.isWicket) {
    return `WICKET! ${ball.dismissedPlayer?.name ?? 'Batter'} dismissed — ${ball.dismissalType?.replace(/_/g, ' ') ?? 'out'}!`;
  }
  const dType = ball.deliveryType;
  if (dType === 'WIDE') return 'Wide ball.';
  if (dType === 'NO_BALL') return `No-ball${ball.batsmanRuns > 0 ? `, ${ball.batsmanRuns} run${ball.batsmanRuns > 1 ? 's' : ''} off the bat` : ''}. Free hit next.`;
  if (ball.totalRuns === 0) return 'Dot ball.';
  if (ball.totalRuns === 4) return 'FOUR!';
  if (ball.totalRuns === 6) return 'SIX!';
  return `${ball.totalRuns} run${ball.totalRuns > 1 ? 's' : ''}.`;
}

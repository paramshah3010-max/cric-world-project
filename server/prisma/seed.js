// ---------------------------------------------------------------------------
// CRIC WORLD — Database seed (DEMO DATA)
//
// All teams, players, tournaments and matches below are FICTIONAL and exist
// only to make the foundation feel alive during development. None of it
// represents real cricket teams, players or results.
// ---------------------------------------------------------------------------
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hoursFromNow = (h) => new Date(Date.now() + h * 60 * 60 * 1000);

// ---------------------------------------------------------------------------
// Phase 2A scoring demo — Harbour Kings vs Summit Titans (T20, completed)
// Idempotent: removes + recreates only scoring data for this specific match.
// ---------------------------------------------------------------------------
async function seedPhase2A() {
  console.log('[seed:phase2a] Looking up demo match...');

  const hkTeam = await prisma.team.findUnique({ where: { name: 'Harbour Kings' } });
  const stTeam = await prisma.team.findUnique({ where: { name: 'Summit Titans' } });

  if (!hkTeam || !stTeam) {
    console.log('[seed:phase2a] Harbour Kings or Summit Titans not found — skipping scoring seed.');
    return;
  }

  const demoMatch = await prisma.match.findFirst({
    where: { homeTeamId: hkTeam.id, awayTeamId: stTeam.id, status: 'COMPLETED' },
  });

  if (!demoMatch) {
    console.log('[seed:phase2a] HK vs ST completed match not found — skipping scoring seed.');
    return;
  }

  // Remove existing Phase 2A data for this match (idempotent).
  const existingInnings = await prisma.innings.findMany({
    where: { matchId: demoMatch.id },
    select: { id: true },
  });
  const inningsIds = existingInnings.map((i) => i.id);

  if (inningsIds.length > 0) {
    console.log('[seed:phase2a] Clearing existing scoring data for this match...');
    await prisma.commentary.deleteMany({ where: { matchId: demoMatch.id } });
    for (const iid of inningsIds) {
      await prisma.fallOfWicket.deleteMany({ where: { inningsId: iid } });
      await prisma.partnership.deleteMany({ where: { inningsId: iid } });
      await prisma.bowlingFigure.deleteMany({ where: { inningsId: iid } });
      await prisma.battingScore.deleteMany({ where: { inningsId: iid } });
    }
    await prisma.ball.deleteMany({
      where: { over: { inningsId: { in: inningsIds } } },
    });
    await prisma.over.deleteMany({ where: { inningsId: { in: inningsIds } } });
    await prisma.innings.deleteMany({ where: { matchId: demoMatch.id } });
  }

  // Fetch players for both teams.
  const hkPlayers = await prisma.player.findMany({
    where: { teamId: hkTeam.id },
  });
  const stPlayers = await prisma.player.findMany({
    where: { teamId: stTeam.id },
  });

  const byRole = (pool, role) =>
    pool.find((p) => p.role === role) ?? pool[0];

  const hkBatter1 = byRole(hkPlayers, 'BATTER');
  const hkBatter2 = byRole(hkPlayers, 'ALL_ROUNDER');
  const hkBowler = byRole(hkPlayers, 'BOWLER');
  const stBatter1 = byRole(stPlayers, 'BATTER');
  const stBatter2 = byRole(stPlayers, 'ALL_ROUNDER');
  const stBowler = byRole(stPlayers, 'BOWLER');

  // ── Innings 1: Harbour Kings bat first ─────────────────────────────────
  console.log('[seed:phase2a] Creating innings 1 — Harbour Kings batting...');

  const inn1 = await prisma.innings.create({
    data: {
      inningsNumber: 1,
      matchId: demoMatch.id,
      battingTeamId: hkTeam.id,
      bowlingTeamId: stTeam.id,
      totalRuns: 176,
      totalWickets: 6,
      totalOvers: 20.0,
      totalExtras: 11,
      byes: 2,
      legByes: 3,
      wides: 4,
      noBalls: 2,
      status: 'COMPLETED',
    },
  });

  // Batting scores — HK
  await prisma.battingScore.create({
    data: {
      inningsId: inn1.id, playerId: hkBatter1.id, battingPosition: 1,
      runs: 68, ballsFaced: 45, fours: 7, sixes: 2, strikeRate: 151.11,
      isNotOut: false, dismissalType: 'CAUGHT',
      dismissedBy: stBowler.name, fielderName: stBatter2.name,
    },
  });
  await prisma.battingScore.create({
    data: {
      inningsId: inn1.id, playerId: hkBatter2.id, battingPosition: 2,
      runs: 42, ballsFaced: 35, fours: 4, sixes: 1, strikeRate: 120.0,
      isNotOut: false, dismissalType: 'BOWLED', dismissedBy: stBowler.name,
    },
  });
  await prisma.battingScore.create({
    data: {
      inningsId: inn1.id, playerId: hkBowler.id, battingPosition: 3,
      runs: 31, ballsFaced: 22, fours: 3, sixes: 1, strikeRate: 140.91,
      isNotOut: false, dismissalType: 'LBW', dismissedBy: stBowler.name,
    },
  });

  // Bowling figures — ST (bowling team for innings 1)
  await prisma.bowlingFigure.create({
    data: {
      inningsId: inn1.id, playerId: stBowler.id,
      overs: 4.0, ballsBowled: 24, maidens: 0, runsConceded: 32,
      wickets: 2, economy: 8.0, widesBowled: 1, noBallsBowled: 0,
    },
  });
  await prisma.bowlingFigure.create({
    data: {
      inningsId: inn1.id, playerId: stBatter1.id,
      overs: 4.0, ballsBowled: 24, maidens: 0, runsConceded: 35,
      wickets: 1, economy: 8.75, widesBowled: 2, noBallsBowled: 1,
    },
  });
  await prisma.bowlingFigure.create({
    data: {
      inningsId: inn1.id, playerId: stBatter2.id,
      overs: 4.0, ballsBowled: 24, maidens: 0, runsConceded: 38,
      wickets: 0, economy: 9.5, widesBowled: 1, noBallsBowled: 0,
    },
  });

  // ── Innings 1 — Over 1 ────────────────────────────────────────────────
  const ov1_1 = await prisma.over.create({
    data: { inningsId: inn1.id, overNumber: 1, legalBallCount: 6,
            totalRuns: 11, bowlerRuns: 11, wickets: 0, maiden: 0,
            status: 'COMPLETED' },
  });
  await prisma.ball.createMany({
    data: [
      { overId: ov1_1.id, ballNumber: 1, legalBallNumber: 1, strikerId: hkBatter1.id, nonStrikerId: hkBatter2.id, bowlerId: stBowler.id, deliveryType: 'LEGAL', batsmanRuns: 1, totalRuns: 1, commentaryText: 'Pushed to mid-off for a quick single.' },
      { overId: ov1_1.id, ballNumber: 2, legalBallNumber: 2, strikerId: hkBatter2.id, nonStrikerId: hkBatter1.id, bowlerId: stBowler.id, deliveryType: 'LEGAL', batsmanRuns: 0, totalRuns: 0, commentaryText: 'Good length on off, defended.' },
      { overId: ov1_1.id, ballNumber: 3, legalBallNumber: null, strikerId: hkBatter2.id, nonStrikerId: hkBatter1.id, bowlerId: stBowler.id, deliveryType: 'WIDE', batsmanRuns: 0, extras: 1, extrasType: 'wide', totalRuns: 1, commentaryText: 'Wide down the leg side.' },
      { overId: ov1_1.id, ballNumber: 4, legalBallNumber: 3, strikerId: hkBatter2.id, nonStrikerId: hkBatter1.id, bowlerId: stBowler.id, deliveryType: 'LEGAL', batsmanRuns: 4, totalRuns: 4, commentaryText: 'Driven through covers for four!' },
      { overId: ov1_1.id, ballNumber: 5, legalBallNumber: 4, strikerId: hkBatter2.id, nonStrikerId: hkBatter1.id, bowlerId: stBowler.id, deliveryType: 'LEGAL', batsmanRuns: 1, totalRuns: 1, commentaryText: 'Turned to square leg.' },
      { overId: ov1_1.id, ballNumber: 6, legalBallNumber: 5, strikerId: hkBatter1.id, nonStrikerId: hkBatter2.id, bowlerId: stBowler.id, deliveryType: 'LEGAL', batsmanRuns: 4, totalRuns: 4, commentaryText: 'Pulled away to the midwicket boundary!' },
      { overId: ov1_1.id, ballNumber: 7, legalBallNumber: 6, strikerId: hkBatter1.id, nonStrikerId: hkBatter2.id, bowlerId: stBowler.id, deliveryType: 'LEGAL', batsmanRuns: 0, totalRuns: 0, commentaryText: 'Dot ball to finish the over.' },
    ],
  });

  // ── Innings 1 — Over 2 ────────────────────────────────────────────────
  const ov1_2 = await prisma.over.create({
    data: { inningsId: inn1.id, overNumber: 2, legalBallCount: 6,
            totalRuns: 14, bowlerRuns: 14, wickets: 0, maiden: 0,
            status: 'COMPLETED' },
  });
  await prisma.ball.createMany({
    data: [
      { overId: ov1_2.id, ballNumber: 1, legalBallNumber: 1, strikerId: hkBatter1.id, nonStrikerId: hkBatter2.id, bowlerId: stBatter1.id, deliveryType: 'LEGAL', batsmanRuns: 6, totalRuns: 6, commentaryText: 'SIX! Launched over long-on!' },
      { overId: ov1_2.id, ballNumber: 2, legalBallNumber: 2, strikerId: hkBatter1.id, nonStrikerId: hkBatter2.id, bowlerId: stBatter1.id, deliveryType: 'LEGAL', batsmanRuns: 4, totalRuns: 4, commentaryText: 'FOUR! Edged past slip, races away.' },
      { overId: ov1_2.id, ballNumber: 3, legalBallNumber: 3, strikerId: hkBatter1.id, nonStrikerId: hkBatter2.id, bowlerId: stBatter1.id, deliveryType: 'LEGAL', batsmanRuns: 0, totalRuns: 0, commentaryText: 'Beaten! Swing and a miss outside off.' },
      { overId: ov1_2.id, ballNumber: 4, legalBallNumber: null, strikerId: hkBatter1.id, nonStrikerId: hkBatter2.id, bowlerId: stBatter1.id, deliveryType: 'NO_BALL', batsmanRuns: 1, extras: 1, extrasType: 'no-ball', totalRuns: 2, commentaryText: 'No-ball! Overstepping, flicked to fine leg. Free hit next.' },
      { overId: ov1_2.id, ballNumber: 5, legalBallNumber: 4, strikerId: hkBatter2.id, nonStrikerId: hkBatter1.id, bowlerId: stBatter1.id, deliveryType: 'LEGAL', batsmanRuns: 0, totalRuns: 0, commentaryText: 'Free hit — swing and a miss!' },
      { overId: ov1_2.id, ballNumber: 6, legalBallNumber: 5, strikerId: hkBatter2.id, nonStrikerId: hkBatter1.id, bowlerId: stBatter1.id, deliveryType: 'LEGAL', batsmanRuns: 1, totalRuns: 1, commentaryText: 'Single to deep point.' },
      { overId: ov1_2.id, ballNumber: 7, legalBallNumber: 6, strikerId: hkBatter1.id, nonStrikerId: hkBatter2.id, bowlerId: stBatter1.id, deliveryType: 'LEGAL', batsmanRuns: 1, totalRuns: 1, commentaryText: 'Pushed to cover, keeps the strike.' },
    ],
  });

  // ── Innings 1 — Over 3 (wicket over) ──────────────────────────────────
  const ov1_3 = await prisma.over.create({
    data: { inningsId: inn1.id, overNumber: 3, legalBallCount: 6,
            totalRuns: 9, bowlerRuns: 7, wickets: 1, maiden: 0,
            status: 'COMPLETED' },
  });
  await prisma.ball.createMany({
    data: [
      { overId: ov1_3.id, ballNumber: 1, legalBallNumber: 1, strikerId: hkBatter1.id, nonStrikerId: hkBatter2.id, bowlerId: stBatter2.id, deliveryType: 'LEGAL', batsmanRuns: 1, totalRuns: 1, commentaryText: 'Single to midwicket.' },
      { overId: ov1_3.id, ballNumber: 2, legalBallNumber: 2, strikerId: hkBatter2.id, nonStrikerId: hkBatter1.id, bowlerId: stBatter2.id, deliveryType: 'LEGAL', batsmanRuns: 0, extras: 2, extrasType: 'bye', totalRuns: 2, commentaryText: 'Beaten! Keeper fumbles, they run two byes.' },
      { overId: ov1_3.id, ballNumber: 3, legalBallNumber: 3, strikerId: hkBatter2.id, nonStrikerId: hkBatter1.id, bowlerId: stBatter2.id, deliveryType: 'LEGAL', batsmanRuns: 4, totalRuns: 4, commentaryText: 'FOUR! Lofted over mid-off.' },
      { overId: ov1_3.id, ballNumber: 4, legalBallNumber: 4, strikerId: hkBatter2.id, nonStrikerId: hkBatter1.id, bowlerId: stBatter2.id, deliveryType: 'LEGAL', batsmanRuns: 0, totalRuns: 0, commentaryText: 'Dot ball, tight line on middle.' },
      { overId: ov1_3.id, ballNumber: 5, legalBallNumber: 5, strikerId: hkBatter2.id, nonStrikerId: hkBatter1.id, bowlerId: stBatter2.id, deliveryType: 'LEGAL', batsmanRuns: 0, totalRuns: 0, isWicket: true, dismissalType: 'BOWLED', dismissedPlayerId: hkBatter2.id, commentaryText: 'BOWLED! Cleaned him up! Off stump goes cartwheeling.' },
      { overId: ov1_3.id, ballNumber: 6, legalBallNumber: 6, strikerId: hkBowler.id, nonStrikerId: hkBatter1.id, bowlerId: stBatter2.id, deliveryType: 'LEGAL', batsmanRuns: 2, totalRuns: 2, commentaryText: 'New batter gets off the mark with a couple through point.' },
    ],
  });

  // Partnerships — innings 1
  await prisma.partnership.create({
    data: { inningsId: inn1.id, batter1Id: hkBatter1.id, batter2Id: hkBatter2.id,
            runs: 68, ballsFaced: 38, wicketNumber: 1, startOver: 0.0, endOver: 2.5 },
  });
  await prisma.partnership.create({
    data: { inningsId: inn1.id, batter1Id: hkBatter1.id, batter2Id: hkBowler.id,
            runs: 51, ballsFaced: 32, startOver: 2.5 },
  });

  // Fall of wickets — innings 1
  await prisma.fallOfWicket.create({
    data: { inningsId: inn1.id, wicketNumber: 1, playerId: hkBatter2.id,
            teamScore: 68, overNumber: 7.3 },
  });

  // ── Innings 2: Summit Titans chase ────────────────────────────────────
  console.log('[seed:phase2a] Creating innings 2 — Summit Titans batting...');

  const inn2 = await prisma.innings.create({
    data: {
      inningsNumber: 2,
      matchId: demoMatch.id,
      battingTeamId: stTeam.id,
      bowlingTeamId: hkTeam.id,
      totalRuns: 171,
      totalWickets: 8,
      totalOvers: 20.0,
      totalExtras: 9,
      byes: 1,
      legByes: 2,
      wides: 5,
      noBalls: 1,
      status: 'COMPLETED',
    },
  });

  // Batting scores — ST
  await prisma.battingScore.create({
    data: {
      inningsId: inn2.id, playerId: stBatter1.id, battingPosition: 1,
      runs: 55, ballsFaced: 38, fours: 5, sixes: 2, strikeRate: 144.74,
      isNotOut: false, dismissalType: 'CAUGHT',
      dismissedBy: hkBowler.name, fielderName: hkBatter1.name,
    },
  });
  await prisma.battingScore.create({
    data: {
      inningsId: inn2.id, playerId: stBatter2.id, battingPosition: 2,
      runs: 37, ballsFaced: 29, fours: 3, sixes: 1, strikeRate: 127.59,
      isNotOut: false, dismissalType: 'LBW', dismissedBy: hkBowler.name,
    },
  });
  await prisma.battingScore.create({
    data: {
      inningsId: inn2.id, playerId: stBowler.id, battingPosition: 3,
      runs: 24, ballsFaced: 18, fours: 2, sixes: 1, strikeRate: 133.33,
      isNotOut: false, dismissalType: 'RUN_OUT', dismissedBy: hkBatter2.name,
    },
  });

  // Bowling figures — HK (bowling team for innings 2)
  await prisma.bowlingFigure.create({
    data: {
      inningsId: inn2.id, playerId: hkBowler.id,
      overs: 4.0, ballsBowled: 24, maidens: 0, runsConceded: 28,
      wickets: 2, economy: 7.0, widesBowled: 1, noBallsBowled: 0,
    },
  });
  await prisma.bowlingFigure.create({
    data: {
      inningsId: inn2.id, playerId: hkBatter2.id,
      overs: 4.0, ballsBowled: 24, maidens: 0, runsConceded: 34,
      wickets: 1, economy: 8.5, widesBowled: 2, noBallsBowled: 1,
    },
  });
  await prisma.bowlingFigure.create({
    data: {
      inningsId: inn2.id, playerId: hkBatter1.id,
      overs: 4.0, ballsBowled: 24, maidens: 0, runsConceded: 41,
      wickets: 0, economy: 10.25, widesBowled: 1, noBallsBowled: 0,
    },
  });

  // ── Innings 2 — Over 1 ────────────────────────────────────────────────
  const ov2_1 = await prisma.over.create({
    data: { inningsId: inn2.id, overNumber: 1, legalBallCount: 6,
            totalRuns: 10, bowlerRuns: 10, wickets: 0, maiden: 0,
            status: 'COMPLETED' },
  });
  await prisma.ball.createMany({
    data: [
      { overId: ov2_1.id, ballNumber: 1, legalBallNumber: 1, strikerId: stBatter1.id, nonStrikerId: stBatter2.id, bowlerId: hkBowler.id, deliveryType: 'LEGAL', batsmanRuns: 2, totalRuns: 2, commentaryText: 'Clipped off the pads for two.' },
      { overId: ov2_1.id, ballNumber: 2, legalBallNumber: 2, strikerId: stBatter1.id, nonStrikerId: stBatter2.id, bowlerId: hkBowler.id, deliveryType: 'LEGAL', batsmanRuns: 4, totalRuns: 4, commentaryText: 'FOUR! Beautiful cover drive.' },
      { overId: ov2_1.id, ballNumber: 3, legalBallNumber: 3, strikerId: stBatter1.id, nonStrikerId: stBatter2.id, bowlerId: hkBowler.id, deliveryType: 'LEGAL', batsmanRuns: 0, totalRuns: 0, commentaryText: 'Played back to the bowler.' },
      { overId: ov2_1.id, ballNumber: 4, legalBallNumber: null, strikerId: stBatter1.id, nonStrikerId: stBatter2.id, bowlerId: hkBowler.id, deliveryType: 'WIDE', batsmanRuns: 0, extras: 1, extrasType: 'wide', totalRuns: 1, commentaryText: 'Wide outside off stump.' },
      { overId: ov2_1.id, ballNumber: 5, legalBallNumber: 4, strikerId: stBatter1.id, nonStrikerId: stBatter2.id, bowlerId: hkBowler.id, deliveryType: 'LEGAL', batsmanRuns: 1, totalRuns: 1, commentaryText: 'Single to deep square.' },
      { overId: ov2_1.id, ballNumber: 6, legalBallNumber: 5, strikerId: stBatter2.id, nonStrikerId: stBatter1.id, bowlerId: hkBowler.id, deliveryType: 'LEGAL', batsmanRuns: 1, totalRuns: 1, commentaryText: 'Turned to leg side for one.' },
      { overId: ov2_1.id, ballNumber: 7, legalBallNumber: 6, strikerId: stBatter1.id, nonStrikerId: stBatter2.id, bowlerId: hkBowler.id, deliveryType: 'LEGAL', batsmanRuns: 1, totalRuns: 1, commentaryText: 'Pushed to mid-on, keeps the strike.' },
    ],
  });

  // ── Innings 2 — Over 2 (wicket over) ──────────────────────────────────
  const ov2_2 = await prisma.over.create({
    data: { inningsId: inn2.id, overNumber: 2, legalBallCount: 6,
            totalRuns: 15, bowlerRuns: 15, wickets: 1, maiden: 0,
            status: 'COMPLETED' },
  });
  await prisma.ball.createMany({
    data: [
      { overId: ov2_2.id, ballNumber: 1, legalBallNumber: 1, strikerId: stBatter1.id, nonStrikerId: stBatter2.id, bowlerId: hkBatter2.id, deliveryType: 'LEGAL', batsmanRuns: 6, totalRuns: 6, commentaryText: 'SIX! Pulled over deep midwicket!' },
      { overId: ov2_2.id, ballNumber: 2, legalBallNumber: 2, strikerId: stBatter1.id, nonStrikerId: stBatter2.id, bowlerId: hkBatter2.id, deliveryType: 'LEGAL', batsmanRuns: 1, totalRuns: 1, commentaryText: 'Single to deep cover.' },
      { overId: ov2_2.id, ballNumber: 3, legalBallNumber: 3, strikerId: stBatter2.id, nonStrikerId: stBatter1.id, bowlerId: hkBatter2.id, deliveryType: 'LEGAL', batsmanRuns: 4, totalRuns: 4, commentaryText: 'FOUR! Slashed over point.' },
      { overId: ov2_2.id, ballNumber: 4, legalBallNumber: 4, strikerId: stBatter2.id, nonStrikerId: stBatter1.id, bowlerId: hkBatter2.id, deliveryType: 'LEGAL', batsmanRuns: 0, totalRuns: 0, commentaryText: 'Beaten! Good ball nipping away.' },
      { overId: ov2_2.id, ballNumber: 5, legalBallNumber: 5, strikerId: stBatter2.id, nonStrikerId: stBatter1.id, bowlerId: hkBatter2.id, deliveryType: 'LEGAL', batsmanRuns: 0, totalRuns: 0, isWicket: true, dismissalType: 'CAUGHT', dismissedPlayerId: stBatter2.id, fielderId: hkBatter1.id, commentaryText: 'OUT! Caught at deep midwicket! Holes out going for another big one.' },
      { overId: ov2_2.id, ballNumber: 6, legalBallNumber: 6, strikerId: stBowler.id, nonStrikerId: stBatter1.id, bowlerId: hkBatter2.id, deliveryType: 'LEGAL', batsmanRuns: 4, totalRuns: 4, commentaryText: 'FOUR! New batter drives first ball through covers.' },
    ],
  });

  // Partnerships — innings 2
  await prisma.partnership.create({
    data: { inningsId: inn2.id, batter1Id: stBatter1.id, batter2Id: stBatter2.id,
            runs: 55, ballsFaced: 32, wicketNumber: 1, startOver: 0.0, endOver: 1.5 },
  });
  await prisma.partnership.create({
    data: { inningsId: inn2.id, batter1Id: stBatter1.id, batter2Id: stBowler.id,
            runs: 42, ballsFaced: 28, startOver: 1.5 },
  });

  // Fall of wickets — innings 2
  await prisma.fallOfWicket.create({
    data: { inningsId: inn2.id, wicketNumber: 1, playerId: stBatter2.id,
            teamScore: 55, overNumber: 5.2 },
  });

  // ── Commentary log ─────────────────────────────────────────────────────
  await prisma.commentary.createMany({
    data: [
      { matchId: demoMatch.id, inningsId: inn1.id, eventType: 'START_OF_OVER', overLabel: 'Over 1', text: 'Harbour Kings openers walk out. Fast bowler takes the new ball.', timestamp: demoMatch.startTime },
      { matchId: demoMatch.id, inningsId: inn1.id, eventType: 'END_OF_OVER', overLabel: 'Over 1', text: 'End of over 1 — 11 runs, a solid start for the Kings.', timestamp: new Date(demoMatch.startTime.getTime() + 4 * 60 * 1000) },
      { matchId: demoMatch.id, inningsId: inn1.id, eventType: 'WICKET', overLabel: 'Over 3', text: 'WICKET! HK lose their first — ALL_ROUNDER bowled for a well-made 42.', timestamp: new Date(demoMatch.startTime.getTime() + 12 * 60 * 1000) },
      { matchId: demoMatch.id, inningsId: inn1.id, eventType: 'MILESTONE', overLabel: 'Over 5', text: 'FIFTY! HK opener brings up a half-century off just 32 balls.', timestamp: new Date(demoMatch.startTime.getTime() + 20 * 60 * 1000) },
      { matchId: demoMatch.id, inningsId: inn1.id, eventType: 'INNINGS_BREAK', text: 'Innings break — Harbour Kings finish at 176/6 in 20 overs. Summit Titans need 177 to win.', timestamp: new Date(demoMatch.startTime.getTime() + 80 * 60 * 1000) },
      { matchId: demoMatch.id, inningsId: inn2.id, eventType: 'START_OF_OVER', overLabel: 'Over 1', text: 'Summit Titans begin the chase. 177 needed from 20 overs.', timestamp: new Date(demoMatch.startTime.getTime() + 95 * 60 * 1000) },
      { matchId: demoMatch.id, inningsId: inn2.id, eventType: 'WICKET', overLabel: 'Over 2', text: 'WICKET! ST lose their ALL_ROUNDER — caught in the deep for 37.', timestamp: new Date(demoMatch.startTime.getTime() + 105 * 60 * 1000) },
      { matchId: demoMatch.id, inningsId: inn2.id, eventType: 'MILESTONE', overLabel: 'Over 4', text: 'FIFTY! ST opener reaches 50 — the chase is alive!', timestamp: new Date(demoMatch.startTime.getTime() + 115 * 60 * 1000) },
      { matchId: demoMatch.id, eventType: 'MATCH_EVENT', text: 'Match over — Harbour Kings win by 5 runs! What a thriller!', timestamp: new Date(demoMatch.startTime.getTime() + 180 * 60 * 1000) },
    ],
  });

  console.log('[seed:phase2a] Done ✅ — 2 innings, demo overs, balls, batting, bowling, partnerships, FOW, commentary.');
}

async function main() {
  const existingMatchCount = await prisma.match.count();

  let teams, venues, tournaments, matches;

  if (existingMatchCount === 0) {
    console.log('[seed] Seeding Phase 1 data from scratch...');
    await prisma.match.deleteMany();
    await prisma.player.deleteMany();
    await prisma.team.deleteMany();
    await prisma.tournament.deleteMany();
    await prisma.venue.deleteMany();
    await prisma.user.deleteMany();

  // --- Demo users (one per role) ------------------------------------------
  console.log('[seed] Creating demo users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.createMany({
    data: [
      { name: 'Demo Admin', email: 'admin@cricworld.dev', password: passwordHash, role: 'ADMIN' },
      { name: 'Demo Scorer', email: 'scorer@cricworld.dev', password: passwordHash, role: 'SCORER' },
      { name: 'Demo User', email: 'user@cricworld.dev', password: passwordHash, role: 'USER' },
    ],
  });

  // --- Venues --------------------------------------------------------------
  console.log('[seed] Creating venues...');
  const venueData = [
    { name: 'Skyline Arena', city: 'Metro City', country: 'Atlantis', capacity: 52000 },
    { name: 'Harbour Oval', city: 'Port Vale', country: 'Atlantis', capacity: 34000 },
    { name: 'Summit Ground', city: 'Highfield', country: 'Borealis', capacity: 41000 },
    { name: 'Riverside Park', city: 'Kingsford', country: 'Borealis', capacity: 28000 },
  ];
  const venues = [];
  for (const v of venueData) venues.push(await prisma.venue.create({ data: v }));

  // --- Tournaments ---------------------------------------------------------
  console.log('[seed] Creating tournaments...');
  const tournamentData = [
    { name: 'CRIC WORLD Premier League', shortName: 'CWPL', season: '2026', format: 'T20' },
    { name: 'Continental ODI Cup', shortName: 'CODC', season: '2026', format: 'ODI' },
    { name: 'Heritage Test Series', shortName: 'HTS', season: '2026', format: 'TEST' },
  ];
  const tournaments = [];
  for (const t of tournamentData) tournaments.push(await prisma.tournament.create({ data: t }));

  // --- Teams (10) ----------------------------------------------------------
  console.log('[seed] Creating teams...');
  const teamData = [
    { name: 'Metro Warriors', shortName: 'MW', country: 'Atlantis', logoText: 'MW', primary: '#00E5FF' },
    { name: 'Harbour Kings', shortName: 'HK', country: 'Atlantis', logoText: 'HK', primary: '#FFC94A' },
    { name: 'Summit Titans', shortName: 'ST', country: 'Borealis', logoText: 'ST', primary: '#00E5FF' },
    { name: 'Riverside Royals', shortName: 'RR', country: 'Borealis', logoText: 'RR', primary: '#B084FF' },
    { name: 'Desert Falcons', shortName: 'DF', country: 'Zephyria', logoText: 'DF', primary: '#FF6B6B' },
    { name: 'Coastal Sharks', shortName: 'CS', country: 'Zephyria', logoText: 'CS', primary: '#4ADE80' },
    { name: 'Mountain Lions', shortName: 'ML', country: 'Nordica', logoText: 'ML', primary: '#FFC94A' },
    { name: 'Valley Vipers', shortName: 'VV', country: 'Nordica', logoText: 'VV', primary: '#00E5FF' },
    { name: 'Capital Chargers', shortName: 'CC', country: 'Meridia', logoText: 'CC', primary: '#F472B6' },
    { name: 'Northern Knights', shortName: 'NK', country: 'Meridia', logoText: 'NK', primary: '#60A5FA' },
  ];
  const teams = [];
  for (const t of teamData) teams.push(await prisma.team.create({ data: t }));

  // --- Players (30 — 3 per team) ------------------------------------------
  console.log('[seed] Creating players...');
  const firstNames = ['Aarav', 'Liam', 'Noah', 'Kai', 'Ravi', 'Omar', 'Leo', 'Jae', 'Milo', 'Zane',
    'Ethan', 'Arjun', 'Finn', 'Rio', 'Sam', 'Dev', 'Neo', 'Ace', 'Cole', 'Reid',
    'Theo', 'Isa', 'Nate', 'Rex', 'Vik', 'Kian', 'Jude', 'Rory', 'Beau', 'Ari'];
  const lastNames = ['Sharma', 'Cole', 'Rivera', 'Novak', 'Khan', 'Silva', 'Owens', 'Park', 'Reed', 'Frost'];
  const roles = ['BATTER', 'ALL_ROUNDER', 'BOWLER'];
  let playerIdx = 0;
  for (let ti = 0; ti < teams.length; ti++) {
    for (let pi = 0; pi < 3; pi++) {
      await prisma.player.create({
        data: {
          name: `${firstNames[playerIdx]} ${lastNames[ti]}`,
          role: roles[pi],
          battingStyle: pi % 2 === 0 ? 'Right-hand bat' : 'Left-hand bat',
          bowlingStyle: pi === 2 ? 'Right-arm fast' : 'Right-arm off-break',
          country: teams[ti].country,
          jerseyNo: 7 + pi,
          teamId: teams[ti].id,
        },
      });
      playerIdx++;
    }
  }

  // --- Matches (10: 3 live, 3 upcoming, 4 completed) ----------------------
  console.log('[seed] Creating matches...');
  const t20 = tournaments[0];
  const odi = tournaments[1];
  const test = tournaments[2];

  const matches = [
    // LIVE (3)
    {
      name: 'Match 14 — League Stage', format: 'T20', status: 'LIVE',
      startTime: hoursFromNow(-1), tournamentId: t20.id, venueId: venues[0].id,
      homeTeamId: teams[0].id, awayTeamId: teams[1].id,
      homeRuns: 142, homeWickets: 4, homeOvers: 15.2, awayRuns: null, awayWickets: null, awayOvers: null,
      tossWinner: teams[0].shortName, tossDecision: 'BAT',
    },
    {
      name: 'Match 3 — Super Six', format: 'ODI', status: 'LIVE',
      startTime: hoursFromNow(-2), tournamentId: odi.id, venueId: venues[2].id,
      homeTeamId: teams[2].id, awayTeamId: teams[3].id,
      homeRuns: 268, homeWickets: 7, homeOvers: 50.0, awayRuns: 121, awayWickets: 3, awayOvers: 24.4,
      tossWinner: teams[3].shortName, tossDecision: 'BOWL',
    },
    {
      name: 'Match 15 — League Stage', format: 'T20', status: 'LIVE',
      startTime: hoursFromNow(-0.5), tournamentId: t20.id, venueId: venues[1].id,
      homeTeamId: teams[4].id, awayTeamId: teams[5].id,
      homeRuns: 88, homeWickets: 2, homeOvers: 9.5, awayRuns: null, awayWickets: null, awayOvers: null,
      tossWinner: teams[5].shortName, tossDecision: 'BOWL',
    },
    // UPCOMING (3)
    {
      name: 'Match 16 — League Stage', format: 'T20', status: 'UPCOMING',
      startTime: hoursFromNow(6), tournamentId: t20.id, venueId: venues[3].id,
      homeTeamId: teams[6].id, awayTeamId: teams[7].id,
    },
    {
      name: 'Match 4 — Super Six', format: 'ODI', status: 'UPCOMING',
      startTime: hoursFromNow(28), tournamentId: odi.id, venueId: venues[0].id,
      homeTeamId: teams[8].id, awayTeamId: teams[9].id,
    },
    {
      name: '2nd Test — Day 1', format: 'TEST', status: 'UPCOMING',
      startTime: hoursFromNow(52), tournamentId: test.id, venueId: venues[2].id,
      homeTeamId: teams[0].id, awayTeamId: teams[2].id,
    },
    // COMPLETED (4)
    {
      name: 'Match 12 — League Stage', format: 'T20', status: 'COMPLETED',
      startTime: hoursFromNow(-26), tournamentId: t20.id, venueId: venues[0].id,
      homeTeamId: teams[1].id, awayTeamId: teams[2].id,
      homeRuns: 176, homeWickets: 6, homeOvers: 20.0, awayRuns: 171, awayWickets: 8, awayOvers: 20.0,
      tossWinner: teams[1].shortName, tossDecision: 'BAT',
      result: 'Harbour Kings won by 5 runs',
    },
    {
      name: 'Match 13 — League Stage', format: 'T20', status: 'COMPLETED',
      startTime: hoursFromNow(-50), tournamentId: t20.id, venueId: venues[1].id,
      homeTeamId: teams[3].id, awayTeamId: teams[4].id,
      homeRuns: 154, homeWickets: 9, homeOvers: 20.0, awayRuns: 158, awayWickets: 4, awayOvers: 18.3,
      tossWinner: teams[4].shortName, tossDecision: 'BOWL',
      result: 'Desert Falcons won by 6 wickets',
    },
    {
      name: 'Match 2 — Super Six', format: 'ODI', status: 'COMPLETED',
      startTime: hoursFromNow(-74), tournamentId: odi.id, venueId: venues[2].id,
      homeTeamId: teams[5].id, awayTeamId: teams[6].id,
      homeRuns: 241, homeWickets: 10, homeOvers: 48.2, awayRuns: 244, awayWickets: 5, awayOvers: 46.1,
      tossWinner: teams[5].shortName, tossDecision: 'BAT',
      result: 'Mountain Lions won by 5 wickets',
    },
    {
      name: 'Match 11 — League Stage', format: 'T20', status: 'COMPLETED',
      startTime: hoursFromNow(-98), tournamentId: t20.id, venueId: venues[3].id,
      homeTeamId: teams[7].id, awayTeamId: teams[8].id,
      homeRuns: 201, homeWickets: 3, homeOvers: 20.0, awayRuns: 189, awayWickets: 7, awayOvers: 20.0,
      tossWinner: teams[7].shortName, tossDecision: 'BAT',
      result: 'Valley Vipers won by 12 runs',
    },
  ];

  for (const m of matches) await prisma.match.create({ data: m });

    console.log(`[seed] Phase 1: ${teams.length} teams, 30 players, ${tournaments.length} tournaments, ${matches.length} matches, ${venues.length} venues, 3 users.`);
  } else {
    console.log('[seed] Phase 1 data exists — preserving all of it.');
  }

  // Phase 2A scoring demo (idempotent — safe to re-run on every seed)
  await seedPhase2A();
}

main()
  .catch((e) => {
    console.error('[seed] Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

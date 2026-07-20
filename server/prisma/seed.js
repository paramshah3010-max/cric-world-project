// ---------------------------------------------------------------------------
// CRIC WORLD — Database seed (DEMO DATA)
//
// All teams, players, tournaments and matches below are FICTIONAL and exist
// only to make the foundation feel alive during development. None of it
// represents real cricket teams, players or results.
// ---------------------------------------------------------------------------
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hoursFromNow = (h) => new Date(Date.now() + h * 60 * 60 * 1000);

async function main() {
  console.log('[seed] Clearing existing data...');
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

  console.log('[seed] Done ✅');
  console.log(`[seed] ${teams.length} teams, 30 players, ${tournaments.length} tournaments, ${matches.length} matches, ${venues.length} venues, 3 users.`);
}

main()
  .catch((e) => {
    console.error('[seed] Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from '../config/prisma.js';

const matchInclude = {
  tournament: true,
  venue: true,
  homeTeam: true,
  awayTeam: true,
};

// Shape a Prisma match record into the flat structure the frontend expects.
function serializeMatch(match) {
  return {
    id: match.id,
    name: match.name,
    format: match.format,
    status: match.status,
    startTime: match.startTime,
    result: match.result,
    tournament: match.tournament
      ? { id: match.tournament.id, name: match.tournament.name, shortName: match.tournament.shortName }
      : null,
    venue: match.venue
      ? { id: match.venue.id, name: match.venue.name, city: match.venue.city, country: match.venue.country }
      : null,
    toss: match.tossWinner
      ? { winner: match.tossWinner, decision: match.tossDecision }
      : null,
    teams: {
      home: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        shortName: match.homeTeam.shortName,
        logoText: match.homeTeam.logoText,
        primary: match.homeTeam.primary,
        score:
          match.homeRuns != null
            ? { runs: match.homeRuns, wickets: match.homeWickets, overs: match.homeOvers }
            : null,
      },
      away: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        shortName: match.awayTeam.shortName,
        logoText: match.awayTeam.logoText,
        primary: match.awayTeam.primary,
        score:
          match.awayRuns != null
            ? { runs: match.awayRuns, wickets: match.awayWickets, overs: match.awayOvers }
            : null,
      },
    },
  };
}

export async function listMatches(status) {
  const where = status ? { status } : {};
  const matches = await prisma.match.findMany({
    where,
    include: matchInclude,
    orderBy: { startTime: 'asc' },
  });
  return matches.map(serializeMatch);
}

export async function getMatchById(id) {
  const match = await prisma.match.findUnique({
    where: { id },
    include: matchInclude,
  });
  return match ? serializeMatch(match) : null;
}

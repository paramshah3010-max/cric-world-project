import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const playerSelect = {
  id: true,
  name: true,
  role: true,
  battingStyle: true,
  bowlingStyle: true,
  country: true,
  jerseyNo: true,
};

export async function getSquads(matchId) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      homeTeam: {
        select: {
          id: true,
          name: true,
          shortName: true,
          logoText: true,
          primary: true,
          players: { select: playerSelect, orderBy: [{ jerseyNo: 'asc' }, { name: 'asc' }] },
        },
      },
      awayTeam: {
        select: {
          id: true,
          name: true,
          shortName: true,
          logoText: true,
          primary: true,
          players: { select: playerSelect, orderBy: [{ jerseyNo: 'asc' }, { name: 'asc' }] },
        },
      },
    },
  });

  if (!match) throw ApiError.notFound('Match not found');

  return match;
}

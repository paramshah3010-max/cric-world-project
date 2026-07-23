import { api } from './api';
import type { Match, MatchStatus, Scorecard, CommentaryData, SquadsData } from '../utils/types';

const statusPath: Record<MatchStatus, string> = {
  LIVE: '/matches/live',
  UPCOMING: '/matches/upcoming',
  COMPLETED: '/matches/completed',
};

export const matchesApi = {
  all: () => api.get<Match[]>('/matches'),
  byStatus: (status: MatchStatus) => api.get<Match[]>(statusPath[status]),
  byId: (id: string) => api.get<Match>(`/matches/${id}`),
  scorecard: (id: string) => api.get<Scorecard>(`/matches/${id}/scorecard`),
  commentary: (id: string, inningsId?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (inningsId) params.set('inningsId', inningsId);
    if (limit) params.set('limit', String(limit));
    const qs = params.toString();
    return api.get<CommentaryData[]>(`/matches/${id}/commentary${qs ? '?' + qs : ''}`);
  },
  squads: (id: string) => api.get<SquadsData>(`/matches/${id}/squads`),
};

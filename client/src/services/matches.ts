import { api } from './api';
import type { Match, MatchStatus, Scorecard } from '../utils/types';

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
};

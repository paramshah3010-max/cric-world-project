export type MatchStatus = 'LIVE' | 'UPCOMING' | 'COMPLETED';

export interface TeamScore {
  runs: number;
  wickets: number;
  overs: number;
}

export interface MatchTeam {
  id: string;
  name: string;
  shortName: string;
  logoText: string | null;
  primary: string | null;
  score: TeamScore | null;
}

export interface Match {
  id: string;
  name: string;
  format: string;
  status: MatchStatus;
  startTime: string;
  result: string | null;
  tournament: { id: string; name: string; shortName: string } | null;
  venue: { id: string; name: string; city: string | null; country: string | null } | null;
  toss: { winner: string; decision: string } | null;
  teams: {
    home: MatchTeam;
    away: MatchTeam;
  };
}

export type UserRole = 'USER' | 'SCORER' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

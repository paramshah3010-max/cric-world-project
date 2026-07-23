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

// ── Phase 2A scorecard types ────────────────────────────────────────────────

export interface BattingScoreData {
  id: string;
  inningsId: string;
  playerId: string;
  player: { id: string; name: string; country: string | null };
  battingPosition: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dismissalType: string | null;
  dismissedBy: string | null;
  fielderName: string | null;
  isNotOut: boolean;
}

export interface BowlingFigureData {
  id: string;
  inningsId: string;
  playerId: string;
  player: { id: string; name: string };
  overs: number;
  ballsBowled: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  widesBowled: number;
  noBallsBowled: number;
}

export interface PartnershipData {
  id: string;
  inningsId: string;
  batter1Id: string;
  batter1: { id: string; name: string };
  batter2Id: string;
  batter2: { id: string; name: string };
  runs: number;
  ballsFaced: number;
  wicketNumber: number | null;
  startOver: number | null;
  endOver: number | null;
}

export interface FallOfWicketData {
  id: string;
  inningsId: string;
  wicketNumber: number;
  playerId: string;
  player: { id: string; name: string };
  teamScore: number;
  overNumber: number;
}

export interface InningsData {
  id: string;
  inningsNumber: number;
  matchId: string;
  battingTeamId: string;
  battingTeam: MatchTeam;
  bowlingTeamId: string;
  bowlingTeam: MatchTeam;
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  totalExtras: number;
  byes: number;
  legByes: number;
  wides: number;
  noBalls: number;
  penalties: number;
  status: string;
  battingScorecard: BattingScoreData[];
  bowlingScorecard: BowlingFigureData[];
  fallOfWickets: FallOfWicketData[];
  partnerships: PartnershipData[];
}

export interface Scorecard {
  id: string;
  name: string;
  format: string;
  status: MatchStatus;
  startTime: string;
  result: string | null;
  tournament: { id: string; name: string; shortName: string } | null;
  venue: { id: string; name: string; city: string | null; country: string | null } | null;
  toss: { winner: string; decision: string } | null;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  innings: InningsData[];
}

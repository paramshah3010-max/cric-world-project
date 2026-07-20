import { Link } from 'react-router-dom';
import type { Match } from '../utils/types';
import StatusBadge from './StatusBadge';
import TeamBadge from './TeamBadge';
import { formatScore, formatDateTime, fromNow } from '../utils/format';

function TeamRow({ team }: { team: Match['teams']['home'] }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <TeamBadge team={team} />
        <div>
          <p className="font-semibold text-white">{team.name}</p>
          <p className="text-xs text-slate-400">{team.shortName}</p>
        </div>
      </div>
      <p className="font-mono text-sm font-semibold text-slate-200">{formatScore(team.score)}</p>
    </div>
  );
}

export default function MatchCard({ match }: { match: Match }) {
  return (
    <Link
      to={`/matches/${match.id}`}
      className="card group block p-5 transition hover:-translate-y-0.5 hover:border-cyan-brand/50 hover:shadow-glow"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-cyan-brand">
            {match.tournament?.shortName ?? 'Fixture'} · {match.format}
          </p>
          <p className="truncate text-xs text-slate-400">{match.name}</p>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="space-y-3">
        <TeamRow team={match.teams.home} />
        <TeamRow team={match.teams.away} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-charcoal-700 pt-3 text-xs text-slate-400">
        <span className="truncate">{match.venue?.name ?? 'Venue TBD'}</span>
        <span>
          {match.status === 'COMPLETED'
            ? (match.result ?? 'Result')
            : match.status === 'LIVE'
              ? 'In progress'
              : `${formatDateTime(match.startTime)} · ${fromNow(match.startTime)}`}
        </span>
      </div>
    </Link>
  );
}

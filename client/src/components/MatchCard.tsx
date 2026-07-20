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
          <p className="text-[11px] uppercase tracking-widest text-slate-500">{team.shortName}</p>
        </div>
      </div>
      <p className="font-display text-sm font-bold tabular-nums text-slate-100">
        {formatScore(team.score)}
      </p>
    </div>
  );
}

export default function MatchCard({ match }: { match: Match }) {
  return (
    <Link
      to={`/matches/${match.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-5 shadow-luxe backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-gold-brand/40 hover:shadow-gold"
    >
      <div className="sheen" />
      {/* top accent line */}
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-brand/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-widest text-gold-brand/90">
            {match.tournament?.shortName ?? 'Fixture'} · {match.format}
          </p>
          <p className="truncate text-xs text-slate-500">{match.name}</p>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="space-y-3">
        <TeamRow team={match.teams.home} />
        <TeamRow team={match.teams.away} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-slate-500">
        <span className="truncate">{match.venue?.name ?? 'Venue TBD'}</span>
        <span className="shrink-0 pl-2 text-right">
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

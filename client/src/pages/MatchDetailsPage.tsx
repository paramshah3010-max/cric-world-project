import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { matchesApi } from '../services/matches';
import StatusBadge from '../components/StatusBadge';
import TeamBadge from '../components/TeamBadge';
import { EmptyState, ErrorState, SectionHeader } from '../components/states';
import { formatScore, formatDateTime } from '../utils/format';
import type { Match } from '../utils/types';

const TABS = ['Summary', 'Scorecard', 'Commentary', 'Statistics', 'Squads'] as const;
type Tab = (typeof TABS)[number];

function TeamLine({ team }: { team: Match['teams']['home'] }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-charcoal-900/60 p-4">
      <div className="flex items-center gap-3">
        <TeamBadge team={team} />
        <div>
          <p className="font-semibold text-white">{team.name}</p>
          <p className="text-xs text-slate-400">{team.shortName}</p>
        </div>
      </div>
      <p className="font-mono text-lg font-bold text-white">{formatScore(team.score)}</p>
    </div>
  );
}

function SummaryTab({ match }: { match: Match }) {
  const facts = [
    ['Tournament', match.tournament?.name ?? '—'],
    ['Match', match.name],
    ['Format', match.format],
    ['Date & Time', formatDateTime(match.startTime)],
    ['Venue', match.venue ? `${match.venue.name}, ${match.venue.city ?? ''}` : '—'],
    ['Toss', match.toss ? `${match.toss.winner} chose to ${match.toss.decision.toLowerCase()}` : '—'],
    ['Result', match.result ?? (match.status === 'LIVE' ? 'In progress' : 'Not started')],
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <TeamLine team={match.teams.home} />
        <TeamLine team={match.teams.away} />
      </div>
      <dl className="card divide-y divide-charcoal-700">
        {facts.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 px-5 py-3">
            <dt className="text-sm text-slate-400">{k}</dt>
            <dd className="text-right text-sm font-medium text-white">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function MatchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('Summary');
  const { data: match, loading, error } = useAsync(() => matchesApi.byId(id!), [id]);

  if (loading) {
    return (
      <div className="container-page py-12">
        <div className="skeleton mb-4 h-6 w-40" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    );
  }
  if (error) return <div className="container-page py-12"><ErrorState message={error} /></div>;
  if (!match) return null;

  return (
    <div className="container-page py-10">
      <Link to="/matches" className="text-sm text-slate-400 hover:text-cyan-brand">
        ← Back to matches
      </Link>

      <div className="card mt-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-brand">
              {match.tournament?.name} · {match.format}
            </p>
            <h1 className="mt-1 text-2xl font-black text-white">
              {match.teams.home.shortName} vs {match.teams.away.shortName}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {match.name} · {match.venue?.name ?? 'Venue TBD'}
            </p>
          </div>
          <StatusBadge status={match.status} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-charcoal-700 pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t ? 'bg-cyan-brand text-charcoal-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'Summary' ? (
          <SummaryTab match={match} />
        ) : (
          <>
            <SectionHeader title={tab} subtitle="Coming soon" />
            <EmptyState
              title={`${tab} not available yet`}
              message="This section will be powered by the live scoring engine in a future release. The layout is ready to connect to real data."
            />
          </>
        )}
      </div>
    </div>
  );
}

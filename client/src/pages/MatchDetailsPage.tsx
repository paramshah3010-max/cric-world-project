import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { matchesApi } from '../services/matches';
import StatusBadge from '../components/StatusBadge';
import TeamBadge from '../components/TeamBadge';
import { EmptyState, ErrorState, SectionHeader } from '../components/states';
import { formatScore, formatDateTime } from '../utils/format';
import type { Match, Scorecard, BattingScoreData, BowlingFigureData, FallOfWicketData, InningsData } from '../utils/types';

const TABS = ['Summary', 'Scorecard', 'Commentary', 'Statistics', 'Squads'] as const;
type Tab = (typeof TABS)[number];

function TeamLine({ team }: { team: Match['teams']['home'] }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.03] p-4">
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
      <dl className="card divide-y divide-white/[0.06]">
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

// ── Scorecard tab ───────────────────────────────────────────────────────────

function DismissalInfo({ bat }: { bat: BattingScoreData }) {
  if (bat.isNotOut) return <span className="text-slate-400">not out</span>;
  const type = bat.dismissalType?.replace(/_/g, ' ')?.toLowerCase() ?? 'out';
  const by = bat.dismissedBy ? ` b ${bat.dismissedBy}` : '';
  const fld = bat.fielderName ? ` c ${bat.fielderName}` : '';
  return <span className="text-slate-400">{fld}{by} {type}</span>;
}

function BattingTable({ batting }: { batting: BattingScoreData[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-luxe text-slate-500">
            <th className="pb-2 pr-2 w-8">#</th>
            <th className="pb-2 pr-2">Batter</th>
            <th className="pb-2 px-3 text-right">R</th>
            <th className="pb-2 px-3 text-right">B</th>
            <th className="pb-2 px-3 text-right">4s</th>
            <th className="pb-2 px-3 text-right">6s</th>
            <th className="pb-2 pl-3 text-right">SR</th>
          </tr>
        </thead>
        <tbody>
          {batting.map((bat) => (
            <tr key={bat.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
              <td className="py-2 pr-2 text-slate-500">{bat.battingPosition}</td>
              <td className="py-2 pr-2">
                <p className="font-medium text-white">{bat.player.name}</p>
                <p className="text-[11px] leading-tight"><DismissalInfo bat={bat} /></p>
              </td>
              <td className="py-2 px-3 text-right font-mono font-bold text-white">{bat.runs}</td>
              <td className="py-2 px-3 text-right text-slate-300">{bat.ballsFaced}</td>
              <td className="py-2 px-3 text-right text-slate-400">{bat.fours}</td>
              <td className="py-2 px-3 text-right text-slate-400">{bat.sixes}</td>
              <td className="py-2 pl-3 text-right text-slate-400">{bat.strikeRate.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BowlingTable({ bowling }: { bowling: BowlingFigureData[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-luxe text-slate-500">
            <th className="pb-2 pr-2">Bowler</th>
            <th className="pb-2 px-3 text-right">O</th>
            <th className="pb-2 px-3 text-right">M</th>
            <th className="pb-2 px-3 text-right">R</th>
            <th className="pb-2 px-3 text-right">W</th>
            <th className="pb-2 pl-3 text-right">Econ</th>
          </tr>
        </thead>
        <tbody>
          {bowling.map((bowl) => (
            <tr key={bowl.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
              <td className="py-2 pr-2 font-medium text-white">{bowl.player.name}</td>
              <td className="py-2 px-3 text-right font-mono text-slate-300">{bowl.overs}</td>
              <td className="py-2 px-3 text-right text-slate-400">{bowl.maidens}</td>
              <td className="py-2 px-3 text-right font-mono font-semibold text-white">{bowl.runsConceded}</td>
              <td className="py-2 px-3 text-right font-mono font-bold text-gold-brand">{bowl.wickets}</td>
              <td className="py-2 pl-3 text-right text-slate-400">{bowl.economy.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FallOfWickets({ fow }: { fow: FallOfWicketData[] }) {
  return (
    <div className="flex flex-wrap gap-3 text-sm">
      {fow.map((f) => (
        <span key={f.id} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1">
          <span className="font-mono text-white">{f.wicketNumber}-{f.teamScore}</span>
          <span className="text-xs text-slate-500">({f.player.name}, {f.overNumber} ov)</span>
        </span>
      ))}
    </div>
  );
}

function InningsBlock({ inn }: { inn: InningsData }) {
  const extras = [];
  if (inn.byes > 0) extras.push(`${inn.byes}b`);
  if (inn.legByes > 0) extras.push(`${inn.legByes}lb`);
  if (inn.wides > 0) extras.push(`${inn.wides}w`);
  if (inn.noBalls > 0) extras.push(`${inn.noBalls}nb`);

  return (
    <div className="card p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <TeamBadge team={inn.battingTeam} />
          <div>
            <p className="font-bold text-white">{inn.battingTeam?.name} Innings</p>
            <p className="text-xs text-slate-400">
              {inn.totalRuns}/{inn.totalWickets} &middot; {inn.totalOvers} ov
              {extras.length > 0 && <>&middot; Extras: {inn.totalExtras} ({extras.join(', ')})</>}
            </p>
          </div>
        </div>
      </div>

      {inn.battingScorecard.length > 0 ? (
        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-luxe text-slate-500">Batting</h4>
          <BattingTable batting={inn.battingScorecard} />
        </div>
      ) : (
        <p className="text-sm text-slate-500">Yet to bat</p>
      )}

      {inn.fallOfWickets.length > 0 && (
        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-luxe text-slate-500">Fall of Wickets</h4>
          <FallOfWickets fow={inn.fallOfWickets} />
        </div>
      )}

      {inn.bowlingScorecard.length > 0 && (
        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-luxe text-slate-500">Bowling</h4>
          <BowlingTable bowling={inn.bowlingScorecard} />
        </div>
      )}
    </div>
  );
}

function ScorecardTab({ scorecard }: { scorecard: Scorecard }) {
  return (
    <div className="space-y-6">
      {scorecard.innings.map((inn) => (
        <InningsBlock key={inn.id} inn={inn} />
      ))}
      {scorecard.innings.length === 0 && (
        <EmptyState title="No scorecard data" message="This match doesn't have any innings data yet." />
      )}
    </div>
  );
}

export default function MatchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('Summary');
  const { data: match, loading, error } = useAsync(() => matchesApi.byId(id!), [id]);
  const { data: scorecard, loading: scLoading, error: scError } = useAsync(() => matchesApi.scorecard(id!), [id]);

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
      <Link to="/matches" className="text-sm text-slate-400 transition hover:text-gold-brand">
        ← Back to matches
      </Link>

      <div className="card mt-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-luxe text-gold-brand/90">
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

      <div className="mt-6 flex flex-wrap gap-2 border-b border-white/[0.06] pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === t
                ? 'bg-gold-sheen text-charcoal-950 shadow-gold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'Summary' ? (
          <SummaryTab match={match} />
        ) : tab === 'Scorecard' ? (
          scLoading ? (
            <>
              <SectionHeader title="Scorecard" subtitle="Loading..." />
              <div className="skeleton h-32 w-full rounded-2xl" />
            </>
          ) : scError ? (
            <ErrorState message={scError} />
          ) : scorecard ? (
            <ScorecardTab scorecard={scorecard} />
          ) : null
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

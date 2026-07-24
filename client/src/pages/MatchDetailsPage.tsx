import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { matchesApi } from '../services/matches';
import StatusBadge from '../components/StatusBadge';
import TeamBadge from '../components/TeamBadge';
import { EmptyState, ErrorState, SectionHeader } from '../components/states';
import { formatScore, formatDateTime } from '../utils/format';
import type { Match, Scorecard, BattingScoreData, BowlingFigureData, FallOfWicketData, InningsData, CommentaryData, SquadsData, SquadPlayer, TeamSquad } from '../utils/types';

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

// ── Statistics tab ──────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-luxe text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function InningsStats({ inn }: { inn: InningsData }) {
  const runRate = inn.totalOvers > 0 ? (inn.totalRuns / inn.totalOvers).toFixed(2) : '—';
  const totalFours = inn.battingScorecard.reduce((s, b) => s + b.fours, 0);
  const totalSixes = inn.battingScorecard.reduce((s, b) => s + b.sixes, 0);
  const boundaries = totalFours + totalSixes;
  const extras = inn.byes + inn.legByes + inn.wides + inn.noBalls + inn.penalties;

  const topBatter = [...inn.battingScorecard].sort((a, b) => b.runs - a.runs)[0];
  const topBowler = [...inn.bowlingScorecard].sort((a, b) => b.wickets - a.wickets || a.economy - b.economy)[0];
  const bestPartnership = [...inn.partnerships].sort((a, b) => b.runs - a.runs)[0];

  return (
    <div className="card p-5 space-y-5">
      <div className="flex items-center gap-3">
        <TeamBadge team={inn.battingTeam} />
        <div>
          <p className="font-bold text-white">{inn.battingTeam?.name}</p>
          <p className="text-xs text-slate-400">
            {inn.totalRuns}/{inn.totalWickets} in {inn.totalOvers} overs &middot; RR {runRate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Run Rate" value={runRate} sub="runs/over" />
        <StatCard label="Boundaries" value={String(boundaries)} sub={`${totalFours}×4  ${totalSixes}×6`} />
        <StatCard label="Extras" value={String(extras)} sub={`b${inn.byes} lb${inn.legByes} w${inn.wides} nb${inn.noBalls}`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {topBatter && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-luxe text-slate-500">Top Batter</p>
            <p className="mt-1 font-semibold text-white">{topBatter.player.name}</p>
            <div className="mt-2 flex gap-4 text-sm">
              <span className="font-mono text-white">{topBatter.runs} <span className="text-slate-400">runs</span></span>
              <span className="font-mono text-white">{topBatter.ballsFaced} <span className="text-slate-400">balls</span></span>
              <span className="font-mono text-white">{topBatter.strikeRate.toFixed(0)} <span className="text-slate-400">SR</span></span>
            </div>
          </div>
        )}
        {topBowler && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-luxe text-slate-500">Top Bowler</p>
            <p className="mt-1 font-semibold text-white">{topBowler.player.name}</p>
            <div className="mt-2 flex gap-4 text-sm">
              <span className="font-mono text-white">{topBowler.wickets} <span className="text-slate-400">wkts</span></span>
              <span className="font-mono text-white">{topBowler.runsConceded} <span className="text-slate-400">runs</span></span>
              <span className="font-mono text-white">{topBowler.economy.toFixed(1)} <span className="text-slate-400">econ</span></span>
            </div>
          </div>
        )}
      </div>

      {bestPartnership && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-luxe text-slate-500">Best Partnership</p>
          <p className="mt-1 text-sm text-white">
            <span className="font-semibold">{bestPartnership.batter1.name}</span>
            <span className="text-slate-400"> & </span>
            <span className="font-semibold">{bestPartnership.batter2.name}</span>
            <span className="ml-2 font-mono text-gold-brand">{bestPartnership.runs}</span>
            <span className="ml-1 text-slate-400">runs ({bestPartnership.ballsFaced} balls)</span>
          </p>
        </div>
      )}

      {inn.fallOfWickets.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-luxe text-slate-500">Wickets Timeline</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {inn.fallOfWickets.map((f, i) => (
              <span key={f.id} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-sm">
                <span className="text-slate-400">W{i + 1}</span>
                <span className="font-mono text-white">{f.teamScore}</span>
                <span className="text-xs text-slate-500">{f.player.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-slate-500 border-t border-white/[0.06] pt-4">
        <span>Fours: <span className="text-slate-300">{totalFours}</span></span>
        <span>Sixes: <span className="text-slate-300">{totalSixes}</span></span>
        <span>Extras: <span className="text-slate-300">{extras}</span></span>
        <span>Wickets: <span className="text-slate-300">{inn.totalWickets}</span></span>
      </div>
    </div>
  );
}

function StatisticsTab({ scorecard }: { scorecard: Scorecard }) {
  return (
    <div className="space-y-6">
      {scorecard.result && (
        <div className="card p-5">
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-luxe text-slate-500">Match Result</h4>
          <span className="rounded-full border border-gold-brand/20 bg-gold-brand/5 px-4 py-1.5 font-mono text-sm font-medium text-gold-brand">
            {scorecard.result}
          </span>
        </div>
      )}

      {scorecard.innings.map((inn) => (
        <InningsStats key={inn.id} inn={inn} />
      ))}

      {scorecard.innings.length === 0 && (
        <EmptyState title="No statistics available" message="This match doesn't have any innings data yet." />
      )}
    </div>
  );
}

// ── Squads tab ─────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, string> = {
  BATTER: 'text-amber-400',
  BOWLER: 'text-cyan-400',
  ALL_ROUNDER: 'text-emerald-400',
  WICKET_KEEPER: 'text-purple-400',
};

function SquadPlayerRow({ player }: { player: SquadPlayer }) {
  return (
    <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
      <td className="py-2 pr-2 text-center font-mono text-sm text-slate-500">{player.jerseyNo ?? '—'}</td>
      <td className="py-2 pr-2">
        <p className="font-medium text-white">{player.name}</p>
        <p className="text-xs text-slate-500">{player.country ?? ''}</p>
      </td>
      <td className="py-2 px-3">
        <span className={`text-xs font-semibold ${ROLE_BADGE[player.role] || 'text-slate-400'}`}>
          {player.role.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="py-2 px-3 text-xs text-slate-400">{player.battingStyle ?? '—'}</td>
      <td className="py-2 pl-3 text-xs text-slate-400">{player.bowlingStyle ?? '—'}</td>
    </tr>
  );
}

function TeamSquadCard({ team }: { team: TeamSquad }) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <TeamBadge team={team} />
        <div>
          <p className="font-bold text-white">{team.name}</p>
          <p className="text-xs text-slate-400">{team.players.length} players</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-luxe text-slate-500">
              <th className="pb-2 pr-2 text-center w-10">#</th>
              <th className="pb-2 pr-2">Player</th>
              <th className="pb-2 px-3">Role</th>
              <th className="pb-2 px-3">Batting</th>
              <th className="pb-2 pl-3">Bowling</th>
            </tr>
          </thead>
          <tbody>
            {team.players.map((p) => (
              <SquadPlayerRow key={p.id} player={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SquadsTab({ squads }: { squads: SquadsData }) {
  return (
    <div className="space-y-6">
      <TeamSquadCard team={squads.homeTeam} />
      <TeamSquadCard team={squads.awayTeam} />
    </div>
  );
}

// ── Commentary tab ──────────────────────────────────────────────────────────

const EVENT_STYLE: Record<string, string> = {
  WICKET: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  MILESTONE: 'bg-gold-brand/15 text-gold-brand ring-1 ring-gold-brand/30',
  START_OF_OVER: 'bg-cyan-400/10 text-cyan-400 ring-1 ring-cyan-400/20',
  END_OF_OVER: 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30',
  INNINGS_BREAK: 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30',
  MATCH_EVENT: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
  DELIVERY: '',
};

const EVENT_LABEL: Record<string, string> = {
  WICKET: 'WICKET',
  MILESTONE: 'MILE',
  START_OF_OVER: 'START',
  END_OF_OVER: 'END',
  INNINGS_BREAK: 'BREAK',
  MATCH_EVENT: 'EVENT',
  DELIVERY: '',
};

function CommentaryTab({ commentary }: { commentary: CommentaryData[] }) {
  // Group by innings
  const groups: Record<string, CommentaryData[]> = {};
  const ungrouped: CommentaryData[] = [];

  for (const c of commentary) {
    if (c.inningsId) {
      (groups[c.inningsId] ??= []).push(c);
    } else {
      ungrouped.push(c);
    }
  }

  const inningsItems = Object.entries(groups).map(([id, items]) => ({ id, items }));

  return (
    <div className="space-y-6">
      {/* Match-level events first (newest first) */}
      {ungrouped.length > 0 && (
        <div className="space-y-2">
          {ungrouped.map((c) => (
            <CommentaryRow key={c.id} c={c} />
          ))}
        </div>
      )}

      {/* Innings groups */}
      {inningsItems.map((group) => (
        <div key={group.id} className="card p-5">
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-luxe text-slate-500">
            Innings
          </h4>
          <div className="space-y-2 divide-y divide-white/[0.04]">
            {group.items.map((c) => (
              <CommentaryRow key={c.id} c={c} />
            ))}
          </div>
        </div>
      ))}

      {commentary.length === 0 && (
        <EmptyState title="No commentary yet" message="Ball-by-ball commentary will appear here once the match is underway." />
      )}
    </div>
  );
}

function CommentaryRow({ c }: { c: CommentaryData }) {
  const badge = EVENT_LABEL[c.eventType] || c.eventType;
  const style = EVENT_STYLE[c.eventType] || '';
  const isWicket = c.eventType === 'WICKET';
  const isMilestone = c.eventType === 'MILESTONE';
  const isMatch = c.eventType === 'MATCH_EVENT' || c.eventType === 'INNINGS_BREAK';

  return (
    <div className={`flex items-start gap-3 py-2 ${isWicket ? 'rounded-lg bg-red-500/[0.04] px-2' : ''}`}>
      {/* Over label or timestamp */}
      <div className="flex shrink-0 flex-col items-center gap-0.5 pt-0.5">
        {c.overLabel ? (
          <span className="font-mono text-xs text-slate-500">{c.overLabel}</span>
        ) : (
          <span className="text-[10px] text-slate-600">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        )}
        {badge && (
          <span className={`chip text-[9px] px-1.5 py-0 ${style}`}>{badge}</span>
        )}
      </div>

      {/* Text */}
      <p className={`text-sm leading-relaxed ${
        isWicket ? 'font-semibold text-red-300' :
        isMilestone ? 'font-semibold text-gold-brand' :
        isMatch ? 'font-medium text-slate-200' :
        'text-slate-400'
      }`}>
        {c.text}
      </p>
    </div>
  );
}

export default function MatchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('Summary');
  const { data: match, loading, error } = useAsync(() => matchesApi.byId(id!), [id]);
  const { data: scorecard, loading: scLoading, error: scError } = useAsync(() => matchesApi.scorecard(id!), [id]);
  const { data: commentary, loading: commLoading, error: commError } = useAsync(() => matchesApi.commentary(id!), [id]);
  const { data: squads, loading: sqLoading, error: sqError } = useAsync(() => matchesApi.squads(id!), [id]);

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
        ) : tab === 'Statistics' ? (
          scLoading ? (
            <>
              <SectionHeader title="Statistics" subtitle="Loading..." />
              <div className="space-y-4">
                {[0, 1].map((i) => <div key={i} className="skeleton h-48 w-full rounded-2xl" />)}
              </div>
            </>
          ) : scError ? (
            <ErrorState message={scError} />
          ) : scorecard ? (
            <StatisticsTab scorecard={scorecard} />
          ) : null
        ) : tab === 'Commentary' ? (
          commLoading ? (
            <>
              <SectionHeader title="Commentary" subtitle="Loading..." />
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-12 w-full rounded-xl" />
                ))}
              </div>
            </>
          ) : commError ? (
            <ErrorState message={commError} />
          ) : commentary ? (
            <CommentaryTab commentary={commentary} />
          ) : null
        ) : tab === 'Squads' ? (
          sqLoading ? (
            <>
              <SectionHeader title="Squads" subtitle="Loading..." />
              <div className="space-y-4">
                {[0, 1].map((i) => <div key={i} className="skeleton h-48 w-full rounded-2xl" />)}
              </div>
            </>
          ) : sqError ? (
            <ErrorState message={sqError} />
          ) : squads ? (
            <SquadsTab squads={squads} />
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

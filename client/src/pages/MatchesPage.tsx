import { NavLink } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { matchesApi } from '../services/matches';
import type { MatchStatus } from '../utils/types';
import MatchGrid from '../components/MatchGrid';

const TABS: { label: string; to: string; filter: MatchStatus | 'ALL' }[] = [
  { label: 'All', to: '/matches', filter: 'ALL' },
  { label: 'Live', to: '/matches/live', filter: 'LIVE' },
  { label: 'Upcoming', to: '/matches/upcoming', filter: 'UPCOMING' },
  { label: 'Completed', to: '/matches/completed', filter: 'COMPLETED' },
];

const titles: Record<MatchStatus | 'ALL', { title: string; subtitle: string }> = {
  ALL: { title: 'All Matches', subtitle: 'Every fixture across CRIC WORLD tournaments' },
  LIVE: { title: 'Live Matches', subtitle: 'Matches in progress right now' },
  UPCOMING: { title: 'Upcoming Matches', subtitle: 'Fixtures coming up next' },
  COMPLETED: { title: 'Completed Matches', subtitle: 'Recent results' },
};

export default function MatchesPage({ filter }: { filter: MatchStatus | 'ALL' }) {
  const state = useAsync(
    () => (filter === 'ALL' ? matchesApi.all() : matchesApi.byStatus(filter)),
    [filter]
  );
  const { title, subtitle } = titles[filter];

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
      <p className="mt-2 text-slate-400">{subtitle}</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-charcoal-700 pb-4">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              `rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-cyan-brand text-charcoal-950'
                  : 'bg-charcoal-800 text-slate-300 hover:text-white'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-8">
        <MatchGrid
          {...state}
          onRetry={undefined}
          emptyTitle={`No ${filter === 'ALL' ? '' : filter.toLowerCase()} matches`.trim()}
          emptyMessage="There is nothing to show here yet — try another tab."
        />
      </div>
    </div>
  );
}

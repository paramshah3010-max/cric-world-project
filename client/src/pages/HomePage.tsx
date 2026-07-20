import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { matchesApi } from '../services/matches';
import MatchGrid from '../components/MatchGrid';
import { SectionHeader } from '../components/states';

const FEATURED_TOURNAMENTS = [
  { name: 'CRIC WORLD Premier League', short: 'CWPL', format: 'T20', accent: '#00E5FF' },
  { name: 'Continental ODI Cup', short: 'CODC', format: 'ODI', accent: '#FFC94A' },
  { name: 'Heritage Test Series', short: 'HTS', format: 'TEST', accent: '#B084FF' },
];

const POPULAR_TEAMS = ['Metro Warriors', 'Harbour Kings', 'Summit Titans', 'Desert Falcons', 'Valley Vipers', 'Northern Knights'];

const LATEST_NEWS = [
  { title: 'Metro Warriors surge to the top of the CWPL table', tag: 'League', time: '2h ago' },
  { title: 'Summit Titans announce squad for the Continental ODI Cup', tag: 'Squads', time: '5h ago' },
  { title: 'Heritage Test Series: five storylines to watch', tag: 'Feature', time: '1d ago' },
];

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-charcoal-700/60">
      <div className="container-page relative py-20 sm:py-28">
        <span className="chip bg-cyan-brand/10 text-cyan-brand ring-1 ring-cyan-brand/30">
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-cyan-brand" />
          Live scores · Ball-by-ball · Stats
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
          CRICKET,{' '}
          <span className="bg-gradient-to-r from-cyan-brand to-gold-brand bg-clip-text text-transparent">
            REIMAGINED.
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-300">
          Follow every match live with real-time scores, ball-by-ball commentary and powerful
          cricket statistics.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/matches/live" className="btn-primary">
            Explore Live Matches
          </Link>
          <Link to="/register" className="btn-ghost">
            Start Scoring
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const live = useAsync(() => matchesApi.byStatus('LIVE'), []);
  const upcoming = useAsync(() => matchesApi.byStatus('UPCOMING'), []);
  const completed = useAsync(() => matchesApi.byStatus('COMPLETED'), []);

  return (
    <>
      <Hero />
      <div className="container-page space-y-16 py-14">
        <section>
          <SectionHeader
            title="Live Matches"
            subtitle="Happening right now"
            action={<Link to="/matches/live" className="text-sm font-semibold text-cyan-brand hover:underline">View all</Link>}
          />
          <MatchGrid {...live} onRetry={undefined} skeletonCount={3} emptyTitle="No live matches" emptyMessage="There are no matches in progress right now." />
        </section>

        <section>
          <SectionHeader
            title="Upcoming Matches"
            subtitle="Coming up next"
            action={<Link to="/matches/upcoming" className="text-sm font-semibold text-cyan-brand hover:underline">View all</Link>}
          />
          <MatchGrid {...upcoming} skeletonCount={3} emptyTitle="No upcoming matches" emptyMessage="New fixtures will appear here soon." />
        </section>

        <section>
          <SectionHeader
            title="Recent Results"
            subtitle="Just concluded"
            action={<Link to="/matches/completed" className="text-sm font-semibold text-cyan-brand hover:underline">View all</Link>}
          />
          <MatchGrid {...completed} skeletonCount={3} emptyTitle="No results yet" emptyMessage="Completed matches will show up here." />
        </section>

        <section>
          <SectionHeader title="Featured Tournaments" subtitle="Competitions on CRIC WORLD" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_TOURNAMENTS.map((t) => (
              <div key={t.short} className="card p-6" style={{ borderColor: `${t.accent}44` }}>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-base font-extrabold"
                  style={{ color: t.accent, backgroundColor: `${t.accent}1A` }}
                >
                  {t.short}
                </div>
                <p className="mt-4 font-semibold text-white">{t.name}</p>
                <p className="mt-1 text-sm text-slate-400">Format · {t.format}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Popular Teams" subtitle="Fan favourites" />
          <div className="flex flex-wrap gap-3">
            {POPULAR_TEAMS.map((name) => (
              <span key={name} className="card px-4 py-2.5 text-sm font-medium text-slate-200">
                {name}
              </span>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Latest News" subtitle="Around the grounds" />
          <div className="grid gap-4">
            {LATEST_NEWS.map((n) => (
              <article key={n.title} className="card flex items-center justify-between gap-4 p-5">
                <div>
                  <span className="chip bg-charcoal-700 text-cyan-brand">{n.tag}</span>
                  <p className="mt-2 font-semibold text-white">{n.title}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-500">{n.time}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

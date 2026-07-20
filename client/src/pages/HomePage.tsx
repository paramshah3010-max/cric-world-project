import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { matchesApi } from '../services/matches';
import MatchGrid from '../components/MatchGrid';
import { SectionHeader } from '../components/states';

function ViewAll({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1 text-sm font-semibold text-gold-brand transition hover:text-gold-brand/80"
    >
      View all
      <span className="transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

const FEATURED_TOURNAMENTS = [
  { name: 'CRIC WORLD Premier League', short: 'CWPL', format: 'T20', accent: '#22E7FF' },
  { name: 'Continental ODI Cup', short: 'CODC', format: 'ODI', accent: '#E9C46A' },
  { name: 'Heritage Test Series', short: 'HTS', format: 'TEST', accent: '#B084FF' },
];

const POPULAR_TEAMS = ['Metro Warriors', 'Harbour Kings', 'Summit Titans', 'Desert Falcons', 'Valley Vipers', 'Northern Knights'];

const LATEST_NEWS = [
  { title: 'Metro Warriors surge to the top of the CWPL table', tag: 'League', time: '2h ago' },
  { title: 'Summit Titans announce squad for the Continental ODI Cup', tag: 'Squads', time: '5h ago' },
  { title: 'Heritage Test Series: five storylines to watch', tag: 'Feature', time: '1d ago' },
];

const HERO_STATS = [
  { value: '10', label: 'Teams' },
  { value: '3', label: 'Tournaments' },
  { value: '24/7', label: 'Live Coverage' },
  { value: '∞', label: 'Moments' },
];

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06] bg-hero-mesh">
      {/* faint grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(70% 60% at 50% 40%, black, transparent)',
        }}
      />
      <div className="container-page relative py-24 sm:py-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold-brand/25 bg-white/[0.03] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-luxe text-gold-brand/90 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gold-brand" />
          Live · Ball-by-ball · Statistics
        </span>
        <h1 className="mt-7 max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-7xl">
          CRICKET,{' '}
          <span className="text-gradient-cyan-gold">REIMAGINED.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          Follow every match live with real-time scores, ball-by-ball commentary and powerful
          cricket statistics — wrapped in a premium, distraction-free experience.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link to="/matches/live" className="btn-primary">
            Explore Live Matches
          </Link>
          <Link to="/register" className="btn-ghost">
            Start Scoring
          </Link>
        </div>

        <div className="mt-14 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04] sm:grid-cols-4">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="bg-charcoal-950/40 px-5 py-5 text-center backdrop-blur">
              <p className="font-display text-2xl font-bold text-gradient-gold">{s.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">{s.label}</p>
            </div>
          ))}
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
      <div className="container-page space-y-20 py-16">
        <section>
          <SectionHeader
            title="Live Matches"
            subtitle="Happening right now"
            action={<ViewAll to="/matches/live" />}
          />
          <MatchGrid {...live} onRetry={undefined} skeletonCount={3} emptyTitle="No live matches" emptyMessage="There are no matches in progress right now." />
        </section>

        <section>
          <SectionHeader
            title="Upcoming Matches"
            subtitle="Coming up next"
            action={<ViewAll to="/matches/upcoming" />}
          />
          <MatchGrid {...upcoming} skeletonCount={3} emptyTitle="No upcoming matches" emptyMessage="New fixtures will appear here soon." />
        </section>

        <section>
          <SectionHeader
            title="Recent Results"
            subtitle="Just concluded"
            action={<ViewAll to="/matches/completed" />}
          />
          <MatchGrid {...completed} skeletonCount={3} emptyTitle="No results yet" emptyMessage="Completed matches will show up here." />
        </section>

        <section>
          <SectionHeader title="Featured Tournaments" subtitle="Competitions on CRIC WORLD" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_TOURNAMENTS.map((t) => (
              <div key={t.short} className="group card overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-gold">
                <div className="sheen" />
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl font-display text-base font-extrabold"
                  style={{ color: t.accent, backgroundColor: `${t.accent}1A`, boxShadow: `inset 0 0 0 1px ${t.accent}44` }}
                >
                  {t.short}
                </div>
                <p className="mt-4 font-semibold text-white">{t.name}</p>
                <p className="eyebrow mt-1.5 !text-slate-500">Format · {t.format}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Popular Teams" subtitle="Fan favourites" />
          <div className="flex flex-wrap gap-3">
            {POPULAR_TEAMS.map((name) => (
              <span key={name} className="card px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-gold-brand/40 hover:text-white">
                {name}
              </span>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Latest News" subtitle="Around the grounds" />
          <div className="grid gap-4">
            {LATEST_NEWS.map((n) => (
              <article key={n.title} className="group card flex items-center justify-between gap-4 p-5 transition hover:border-white/10">
                <div>
                  <span className="chip bg-gold-brand/10 text-gold-brand ring-1 ring-gold-brand/20">{n.tag}</span>
                  <p className="mt-2.5 font-semibold text-white transition group-hover:text-gold-brand">{n.title}</p>
                </div>
                <span className="shrink-0 text-xs uppercase tracking-widest text-slate-500">{n.time}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

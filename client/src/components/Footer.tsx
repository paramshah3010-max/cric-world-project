import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-charcoal-700/80 bg-charcoal-950">
      <div className="container-page flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-slate-400">
            Every Ball. Every Run. Every Moment.
          </p>
        </div>
        <div className="text-sm text-slate-500">
          <p>© {new Date().getFullYear()} CRIC WORLD. Foundation build.</p>
          <p className="mt-1">All teams, players and matches shown are demo data.</p>
        </div>
      </div>
    </footer>
  );
}

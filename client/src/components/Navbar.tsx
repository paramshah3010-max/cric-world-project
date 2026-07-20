import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

// Primary navigation items. Some point to pages that exist in this foundation;
// others are placeholders for future sections (kept so the nav matches the
// intended product shape).
const NAV_ITEMS: { label: string; to: string }[] = [
  { label: 'Home', to: '/' },
  { label: 'Live', to: '/matches/live' },
  { label: 'Matches', to: '/matches' },
  { label: 'Tournaments', to: '/tournaments' },
  { label: 'Teams', to: '/teams' },
  { label: 'Players', to: '/players' },
  { label: 'Rankings', to: '/rankings' },
  { label: 'News', to: '/news' },
];

function linkClass({ isActive }: { isActive: boolean }) {
  return `relative px-3 py-2 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:origin-left after:bg-gold-sheen after:transition-transform ${
    isActive
      ? 'text-white after:scale-x-100'
      : 'text-slate-400 hover:text-white after:scale-x-0 hover:after:scale-x-100'
  }`;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-charcoal-950/70 backdrop-blur-xl">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <div className="hidden items-center lg:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Search"
            className="hidden rounded-full p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-gold-brand sm:inline-flex"
          >
            <SearchIcon />
          </button>
          <button
            aria-label="Notifications"
            className="hidden rounded-full p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-gold-brand sm:inline-flex"
          >
            <BellIcon />
          </button>

          {user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-sheen text-xs font-bold text-charcoal-950">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-white">{user.name.split(' ')[0]}</span>
              </div>
              <button className="btn-ghost !px-4 !py-2" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary hidden sm:inline-flex">
              Login
            </Link>
          )}

          <button
            aria-label="Toggle menu"
            className="rounded-full p-2 text-slate-200 hover:bg-white/[0.06] lg:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/[0.06] bg-charcoal-950/95 backdrop-blur-xl lg:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 flex gap-2 border-t border-white/[0.06] pt-4">
              {user ? (
                <button
                  className="btn-ghost flex-1"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost flex-1" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary flex-1" onClick={() => setOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" strokeLinecap="round" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

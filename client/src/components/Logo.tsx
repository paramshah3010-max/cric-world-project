import { Link } from 'react-router-dom';

// Original text-based CRIC WORLD wordmark. "CRIC" in white, "WORLD" in the
// cyan brand accent, with a small gold ball dot.
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-brand/10 ring-1 ring-cyan-brand/40">
        <span className="h-3 w-3 rounded-full bg-gold-brand shadow-[0_0_10px_2px_rgba(255,201,74,0.6)]" />
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        <span className="text-white">CRIC</span>
        <span className="ml-1 text-cyan-brand">WORLD</span>
      </span>
    </Link>
  );
}

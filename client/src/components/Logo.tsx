import { Link } from 'react-router-dom';

// Original text-based CRIC WORLD wordmark. A gold seam-ball mark sits inside a
// glass tile; "CRIC" in white, "WORLD" in the gold sheen accent.
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gold-brand/40 bg-white/[0.04] shadow-gold">
        <span className="relative h-3.5 w-3.5 rounded-full bg-gold-sheen shadow-[0_0_12px_2px_rgba(233,196,106,0.6)]">
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-charcoal-950/50" />
        </span>
      </span>
      <span className="text-lg font-extrabold tracking-tight font-display leading-none">
        <span className="text-white">CRIC</span>
        <span className="ml-1 text-gradient-gold">WORLD</span>
      </span>
    </Link>
  );
}

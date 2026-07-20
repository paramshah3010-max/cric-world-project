import type { MatchStatus } from '../utils/types';

const styles: Record<MatchStatus, string> = {
  LIVE: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  UPCOMING: 'bg-gold-brand/15 text-gold-brand ring-1 ring-gold-brand/30',
  COMPLETED: 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30',
};

const labels: Record<MatchStatus, string> = {
  LIVE: 'LIVE',
  UPCOMING: 'UPCOMING',
  COMPLETED: 'COMPLETED',
};

export default function StatusBadge({ status }: { status: MatchStatus }) {
  return (
    <span className={`chip ${styles[status]}`}>
      {status === 'LIVE' && (
        <span className="h-2 w-2 animate-pulse-dot rounded-full bg-red-400" />
      )}
      {labels[status]}
    </span>
  );
}

import type { Match } from '../utils/types';
import MatchCard from './MatchCard';
import { MatchCardSkeleton, EmptyState, ErrorState } from './states';

interface Props {
  data: Match[] | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  skeletonCount?: number;
}

export default function MatchGrid({
  data: matches,
  loading,
  error,
  onRetry,
  emptyTitle = 'No matches here yet',
  emptyMessage = 'Check back soon — new fixtures are added regularly.',
  skeletonCount = 6,
}: Props) {
  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (!matches || matches.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((m) => (
        <div key={m.id} className="animate-fade-up">
          <MatchCard match={m} />
        </div>
      ))}
    </div>
  );
}

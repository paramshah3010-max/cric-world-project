import type { ReactNode } from 'react';

// Skeleton placeholder shown while match data loads.
export function MatchCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="skeleton h-11 w-11 rounded-lg" />
              <div className="space-y-2">
                <div className="skeleton h-3 w-28" />
                <div className="skeleton h-2 w-12" />
              </div>
            </div>
            <div className="skeleton h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <div className="skeleton h-3 w-full" />
      </div>
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center">
      <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full border border-gold-brand/20 bg-white/[0.04] text-2xl">
        🏏
      </div>
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="max-w-md text-sm text-slate-400">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 border-red-500/30 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-2xl">
        ⚠️
      </div>
      <p className="text-lg font-semibold text-white">Something went wrong</p>
      <p className="max-w-md text-sm text-slate-400">{message}</p>
      {onRetry && (
        <button className="btn-ghost mt-1" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {subtitle && <p className="eyebrow mb-2">{subtitle}</p>}
        <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          <span className="h-6 w-1 rounded-full bg-gold-sheen" />
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

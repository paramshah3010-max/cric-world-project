export function formatOvers(overs: number | null | undefined): string {
  if (overs == null) return '—';
  return `${overs} ov`;
}

export function formatScore(
  score: { runs: number; wickets: number; overs: number } | null
): string {
  if (!score) return 'Yet to bat';
  return `${score.runs}/${score.wickets} (${score.overs})`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fromNow(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(mins / 60);
  const days = Math.round(hours / 24);
  const unit = days >= 1 ? `${days}d` : hours >= 1 ? `${hours}h` : `${mins}m`;
  return diffMs >= 0 ? `in ${unit}` : `${unit} ago`;
}

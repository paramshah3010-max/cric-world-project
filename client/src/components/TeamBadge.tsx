import type { MatchTeam } from '../utils/types';

// A small square badge showing the team's text logo, tinted with its accent.
export default function TeamBadge({ team, size = 'md' }: { team: MatchTeam; size?: 'sm' | 'md' }) {
  const dims = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-11 w-11 text-sm';
  const color = team.primary ?? '#00E5FF';
  return (
    <span
      className={`flex ${dims} shrink-0 items-center justify-center rounded-lg font-extrabold`}
      style={{
        color,
        backgroundColor: `${color}1A`,
        boxShadow: `inset 0 0 0 1px ${color}55`,
      }}
      aria-hidden
    >
      {team.logoText ?? team.shortName}
    </span>
  );
}

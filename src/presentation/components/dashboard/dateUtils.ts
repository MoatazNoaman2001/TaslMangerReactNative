/**
 * Date formatters for dashboard chips and rows. Locale is left as the
 * device default so e.g. "12 Apr" vs "Apr 12" follows the user's region.
 */

export function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function shortDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/**
 * Compact countdown for a due timestamp relative to `now`.
 * Negative diffs render as "Xm/h/d late"; positive diffs as "In Xm/h"; far
 * future falls back to a calendar date so the chip never shows "In 12d".
 */
export function formatDue(ts: number, now: number): string {
  const diffMin = Math.round((ts - now) / 60_000);
  if (diffMin < -60 * 24) return `${Math.abs(Math.round(diffMin / (60 * 24)))}d late`;
  if (diffMin < -60) return `${Math.abs(Math.round(diffMin / 60))}h late`;
  if (diffMin < 0) return `${Math.abs(diffMin)}m late`;
  if (diffMin < 60) return `In ${diffMin}m`;
  if (diffMin < 60 * 24) return `In ${Math.round(diffMin / 60)}h`;
  return shortDate(ts);
}

/**
 * Rest-timer math. Truth is a persisted wall-clock deadline (endsAt) —
 * reloads, screen-off, and tab discards all recover exactly. Ticking UIs
 * recompute remaining() and never accumulate intervals.
 */

export type TimerSnapshot = {
  startedAt: number;
  endsAt: number;
  totalMs: number;
};

export function remainingMs(t: TimerSnapshot, now: number): number {
  return Math.max(0, t.endsAt - now);
}

/** 0 → 1 as the rest depletes (drives the ring stroke). */
export function progress(t: TimerSnapshot, now: number): number {
  if (t.totalMs <= 0) return 1;
  return Math.min(1, Math.max(0, 1 - remainingMs(t, now) / t.totalMs));
}

/** How long ago the timer expired (0 if still running). */
export function overdueMs(t: TimerSnapshot, now: number): number {
  return Math.max(0, now - t.endsAt);
}

/** "2:37" / "0:08". */
export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** "1:12 ago" for the expired-while-hidden recovery banner. */
export function formatOverdue(ms: number): string {
  return `${formatClock(ms)} ago`;
}

/** Default rest = the midpoint of the slot's range, snapped to 15s. */
export function defaultRestSec(range: { min: number; max: number }): number {
  const mid = (range.min + range.max) / 2;
  return Math.round(mid / 15) * 15;
}

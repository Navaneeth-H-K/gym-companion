/**
 * Which session comes next.
 *
 * Two independent ideas, deliberately not entangled:
 * - WHICH session: a rolling cycle — the successor of whatever was last
 *   completed. Missing a day never deletes a session from the rotation.
 * - WHEN to rest: Sunday is the standing rest day. It's a suggestion, not
 *   a lock — "Train anyway" starts the next session, and the streak engine
 *   counts trained days in any trailing 7, so moving your rest day to
 *   Wednesday costs nothing.
 */
import { weekdayOf } from "./ist";
import { DAY_ORDER, type DayKey } from "./program";

export type CompletedSession = { dateKey: string; dayKey: DayKey };

export type TodaysPlan = {
  suggestion: "train" | "rest" | "done";
  /** The session to start — also what "Train anyway" launches on a Sunday. */
  dayKey: DayKey;
  doneToday: DayKey | null;
};

/** 6 = Sunday (weekdayOf is Monday-indexed). */
export function isRestDay(dateKey: string): boolean {
  return weekdayOf(dateKey) === 6;
}

export function nextDayKey(lastCompleted: DayKey | null): DayKey {
  if (!lastCompleted) return DAY_ORDER[0];
  const idx = DAY_ORDER.indexOf(lastCompleted);
  return DAY_ORDER[(idx + 1) % DAY_ORDER.length];
}

export function todaysPlan(history: CompletedSession[], todayKey: string): TodaysPlan {
  const ordered = [...history].sort((a, b) =>
    a.dateKey === b.dateKey ? 0 : a.dateKey < b.dateKey ? -1 : 1,
  );
  const last = ordered[ordered.length - 1] ?? null;
  const next = nextDayKey(last?.dayKey ?? null);

  if (last?.dateKey === todayKey) {
    return { suggestion: "done", dayKey: next, doneToday: last.dayKey };
  }
  if (isRestDay(todayKey)) {
    return { suggestion: "rest", dayKey: next, doneToday: null };
  }
  return { suggestion: "train", dayKey: next, doneToday: null };
}

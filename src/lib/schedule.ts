/**
 * Rolling training cycle — the successor of the last completed day, never
 * weekday-anchored. Weekdays are display context only. Rest is a
 * suggestion for the day after legs2, and "Train anyway" always works.
 */
import { diffDays } from "./ist";
import { DAY_ORDER, type DayKey } from "./program";

export type CompletedSession = { dateKey: string; dayKey: DayKey };

export type TodaysPlan = {
  /** What the Today card leads with. */
  suggestion: "train" | "rest" | "done";
  /** The session to start (or start anyway on a rest suggestion). */
  dayKey: DayKey;
  /** Set when a session was already completed today. */
  doneToday: DayKey | null;
};

export function nextDayKey(lastCompleted: DayKey | null): DayKey {
  if (!lastCompleted) return DAY_ORDER[0];
  const idx = DAY_ORDER.indexOf(lastCompleted);
  return DAY_ORDER[(idx + 1) % DAY_ORDER.length];
}

/**
 * history: completed sessions, any order. Rest is suggested only on the
 * day immediately after a legs2 completion — miss two days and the app
 * goes straight back to asking for push1.
 */
export function todaysPlan(history: CompletedSession[], todayKey: string): TodaysPlan {
  if (history.length === 0) return { suggestion: "train", dayKey: DAY_ORDER[0], doneToday: null };

  const ordered = [...history].sort((a, b) =>
    a.dateKey === b.dateKey ? 0 : a.dateKey < b.dateKey ? -1 : 1,
  );
  const last = ordered[ordered.length - 1];
  const doneToday = last.dateKey === todayKey ? last.dayKey : null;
  const next = nextDayKey(last.dayKey);

  if (doneToday) return { suggestion: "done", dayKey: next, doneToday };

  const daysSince = diffDays(last.dateKey, todayKey);
  if (last.dayKey === "legs2" && daysSince === 1) {
    return { suggestion: "rest", dayKey: next, doneToday: null };
  }
  return { suggestion: "train", dayKey: next, doneToday: null };
}

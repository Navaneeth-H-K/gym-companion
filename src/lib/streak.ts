/**
 * Streak — rolling 7-day window, weekday-agnostic (resting Wednesday
 * instead of Sunday is NOT a miss). Deterministic fold over completed-day
 * history; never stored except as a recomputable cache.
 *
 * Rules:
 * - A trained day extends the streak.
 * - An untrained day survives when it's the only untrained day in the
 *   trailing 7 (the program's built-in rest).
 * - The 2nd untrained day in a window auto-spends a freeze token (if
 *   held); the day is then protected — it won't count against future
 *   windows. Without a token (or a 3rd rest), the streak resets.
 * - Earn +1 token (cap 2) per completed 6-trained-days-within-7 run.
 */
import { diffDays, shiftDateKey } from "./ist";
import type { DayKey } from "./program";

export type DoneDay = { dateKey: string; dayKey: DayKey };

export type StreakState = {
  current: number;
  best: number;
  freezeTokens: number;
  /** Dates a freeze was auto-spent on (snowflake markers). */
  frozenDates: string[];
  /** Unique dayKeys completed in the current 6-session cycle (the ring). */
  cycleDone: DayKey[];
  doneToday: boolean;
  lastDone: DoneDay | null;
};

export const EMPTY_STREAK: StreakState = {
  current: 0,
  best: 0,
  freezeTokens: 0,
  frozenDates: [],
  cycleDone: [],
  doneToday: false,
  lastDone: null,
};

export function computeStreak(doneDays: DoneDay[], todayKey: string): StreakState {
  if (doneDays.length === 0) return EMPTY_STREAK;

  // Dedupe: several sessions on one date = one credit (first dayKey wins
  // for the date; cycle accumulation below uses the full list).
  const ordered = [...doneDays].sort((a, b) =>
    a.dateKey === b.dateKey ? 0 : a.dateKey < b.dateKey ? -1 : 1,
  );
  const trained = new Set(ordered.map((d) => d.dateKey));
  const protectedDates = new Set<string>();
  const first = ordered[0].dateKey;

  let current = 0;
  let best = 0;
  let tokens = 0;
  const frozen: string[] = [];
  let run: string[] = []; // trained dates since the last token award

  const covered = (k: string) => trained.has(k) || protectedDates.has(k) || k < first;

  for (let d = first; diffDays(d, todayKey) >= 0; d = shiftDateKey(d, 1)) {
    if (trained.has(d)) {
      current += 1;
      best = Math.max(best, current);
      run.push(d);
      while (run.length > 0 && diffDays(run[0], d) > 6) run.shift();
      if (run.length >= 6) {
        tokens = Math.min(2, tokens + 1);
        run = [];
      }
      continue;
    }
    if (d === todayKey) break; // today isn't over — neutral

    let uncovered = 0;
    for (let i = 0; i < 7; i++) {
      const k = shiftDateKey(d, -i);
      if (!covered(k)) uncovered += 1;
    }
    if (uncovered <= 1) continue; // the week's one rest day — free
    if (uncovered === 2 && tokens > 0) {
      tokens -= 1;
      frozen.push(d);
      protectedDates.add(d);
      continue;
    }
    current = 0;
    run = [];
  }

  // Ring: unique dayKeys since the cycle last completed (all 6 collected).
  let cycle: DayKey[] = [];
  for (const d of ordered) {
    if (!cycle.includes(d.dayKey)) cycle.push(d.dayKey);
    if (cycle.length === 6) cycle = [];
  }

  const lastDone = ordered[ordered.length - 1];
  return {
    current,
    best,
    freezeTokens: tokens,
    frozenDates: frozen,
    cycleDone: cycle,
    doneToday: lastDone.dateKey === todayKey,
    lastDone,
  };
}

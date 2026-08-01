/**
 * Warm-up ladder — percentage rungs of the *live* working-weight value
 * (never history: day one has no history). Empty/zero input → no rungs;
 * the UI shows procedural copy instead.
 */
import { roundTo, type IncrementProfile } from "./increments";

export type WarmupSet = { weightKg: number; reps: number };

const LADDERS: Record<0 | 1 | 2 | 3, { pct: number; reps: number }[]> = {
  0: [],
  1: [{ pct: 0.6, reps: 6 }],
  2: [
    { pct: 0.5, reps: 8 },
    { pct: 0.75, reps: 4 },
  ],
  3: [
    { pct: 0.5, reps: 8 },
    { pct: 0.7, reps: 5 },
    { pct: 0.85, reps: 3 },
  ],
};

export function warmupLadder(
  firstWorkingKg: number | null | undefined,
  count: number,
  profile: IncrementProfile,
): WarmupSet[] {
  if (!firstWorkingKg || firstWorkingKg <= 0) return [];
  if (profile.kind === "none") return [];
  const ladder = LADDERS[(Math.max(0, Math.min(3, Math.round(count))) as 0 | 1 | 2 | 3)];

  const rungs: WarmupSet[] = [];
  for (const { pct, reps } of ladder) {
    const weightKg = roundTo(pct * firstWorkingKg, profile, "nearest");
    // A rung at (or above) the working weight isn't a warm-up.
    if (weightKg >= firstWorkingKg) continue;
    // Below what physically exists → skip (empty bar beats a phantom load).
    if (profile.kind === "step" && weightKg < profile.minKg) continue;
    const prev = rungs[rungs.length - 1];
    if (prev && prev.weightKg === weightKg) continue; // collapse duplicates
    rungs.push({ weightKg, reps });
  }
  return rungs;
}

/** Program warm-up count: max for the day's first lift, min afterwards. */
export function warmupCount(
  range: { min: number; max: number },
  isFirstLiftOfDay: boolean,
): number {
  return isFirstLiftOfDay ? range.max : range.min;
}

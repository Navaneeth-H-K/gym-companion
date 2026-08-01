/**
 * P1 prefill — copy the most recent session's working sets into the
 * steppers so the common case is "adjust nothing, tap Log". Pure over
 * rows the caller fetched by progKey; no rules, no Dexie.
 */

export type HistorySet = {
  sessionId: string;
  setIndex: number;
  kind: "warmup" | "working";
  weightKg: number | null;
  reps: number;
  rpe: number | null;
  ts: number;
};

export type Prefill = {
  weightKg: number | null; // null = first-ever, guided empty state
  reps: number;
  fromLastTime: boolean;
};

/** The latest session's working sets (rows may arrive in any order). */
export function lastSessionWorkingSets(history: HistorySet[]): HistorySet[] {
  const working = history.filter((h) => h.kind === "working");
  if (working.length === 0) return [];
  let latestSession = working[0];
  for (const w of working) if (w.ts > latestSession.ts) latestSession = w;
  return working
    .filter((w) => w.sessionId === latestSession.sessionId)
    .sort((a, b) => a.setIndex - b.setIndex);
}

/**
 * Prefill for a given working-set index: same index last time, else the
 * last logged set of that session, else the guided empty state.
 */
export function prefillFor(
  setIndex: number,
  lastSets: HistorySet[],
  repsMin: number,
): Prefill {
  if (lastSets.length === 0) return { weightKg: null, reps: repsMin, fromLastTime: false };
  const match = lastSets.find((s) => s.setIndex === setIndex) ?? lastSets[lastSets.length - 1];
  return { weightKg: match.weightKg, reps: match.reps, fromLastTime: true };
}

/** "Last: 40 kg × 8, 8, 7 @ 8" — one-line history summary for the card. */
export function lastTimeSummary(lastSets: HistorySet[]): string | null {
  if (lastSets.length === 0) return null;
  const w = lastSets[0].weightKg;
  const sameWeight = lastSets.every((s) => s.weightKg === w);
  const reps = lastSets.map((s) => s.reps).join(", ");
  const rpes = lastSets.map((s) => s.rpe).filter((r): r is number => r != null);
  const rpePart = rpes.length ? ` @ ${Math.max(...rpes)}` : "";
  if (sameWeight) return `${w == null ? "BW" : `${w} kg`} × ${reps}${rpePart}`;
  const pairs = lastSets.map((s) => `${s.weightKg ?? "BW"}×${s.reps}`).join(", ");
  return `${pairs}${rpePart}`;
}

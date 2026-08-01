/**
 * Estimated 1RM (Epley) and PR detection. e1RM is only computed for sets
 * of ≤12 reps — 15–20-rep pump work produces garbage estimates and would
 * spam gold. High-rep progress is caught by reps-at-weight and heaviest-
 * weight PRs instead. First-ever sets fire no PRs (nothing to beat).
 */

export function epley(weightKg: number, reps: number): number {
  if (reps <= 1) return round1(weightKg);
  return round1(weightKg * (1 + reps / 30));
}

export const E1RM_MAX_REPS = 12;

export type PrCandidate = { weightKg: number | null; reps: number };

export type PrHistorySet = {
  kind: "warmup" | "working";
  weightKg: number | null;
  reps: number;
};

export type PrEvent =
  | { kind: "e1rm"; value: number; prev: number }
  | { kind: "weight"; weightKg: number; prev: number }
  | { kind: "reps-at-weight"; weightKg: number; reps: number; prev: number };

/**
 * history = every prior working set for this exercise (resolvedId grain —
 * cross-slot mixing is correct for PRs). Bodyweight sets (null weight)
 * never produce weight-based PRs.
 */
export function detectPrs(history: PrHistorySet[], candidate: PrCandidate): PrEvent[] {
  if (candidate.weightKg == null || candidate.weightKg <= 0 || candidate.reps <= 0) return [];
  const prior = history.filter(
    (h) => h.kind === "working" && h.weightKg != null && h.weightKg > 0 && h.reps > 0,
  ) as { kind: "working"; weightKg: number; reps: number }[];
  if (prior.length === 0) return []; // first-ever — no confetti on day one

  const events: PrEvent[] = [];

  const prevMaxWeight = Math.max(...prior.map((p) => p.weightKg));
  if (candidate.weightKg > prevMaxWeight) {
    events.push({ kind: "weight", weightKg: candidate.weightKg, prev: prevMaxWeight });
  }

  if (candidate.reps <= E1RM_MAX_REPS) {
    const qualifying = prior.filter((p) => p.reps <= E1RM_MAX_REPS);
    if (qualifying.length > 0) {
      const prevBest = Math.max(...qualifying.map((p) => epley(p.weightKg, p.reps)));
      const now = epley(candidate.weightKg, candidate.reps);
      if (now > prevBest + 0.1) events.push({ kind: "e1rm", value: now, prev: prevBest });
    }
  }

  const atWeight = prior.filter((p) => p.weightKg === candidate.weightKg);
  if (atWeight.length > 0) {
    const prevReps = Math.max(...atWeight.map((p) => p.reps));
    if (candidate.reps > prevReps) {
      events.push({
        kind: "reps-at-weight",
        weightKg: candidate.weightKg,
        reps: candidate.reps,
        prev: prevReps,
      });
    }
  }

  return events;
}

/** Volume for a logged set, honoring paired-dumbbell doubling. */
export function setVolumeKg(
  weightKg: number | null,
  reps: number,
  volumeFactor: 1 | 2,
): number {
  if (weightKg == null || weightKg <= 0) return 0;
  return weightKg * reps * volumeFactor;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

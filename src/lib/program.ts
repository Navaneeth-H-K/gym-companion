/**
 * Program 18 — Push/Pull/Legs 6x/week (Week 1 sheets, transcribed).
 * The app cycles these six days forever; progression rules move the
 * weights. Rest is a *suggestion* after legs2, not a cycle member —
 * scheduling is a rolling cycle, never weekday-anchored.
 */
import type { ExerciseId } from "./exercises";

export type DayKey = "push1" | "pull1" | "legs1" | "push2" | "pull2" | "legs2";

export type RepRange = { min: number; max: number };
export type RpeTarget = { earlyMin: number; earlyMax: number; last: number };

export type ProgramSlot = {
  slot: number;
  exerciseId: ExerciseId;
  warmupSets: { min: number; max: number };
  workingSets: number;
  reps: RepRange;
  rpe: RpeTarget;
  restSec: { min: number; max: number };
  substitutions: [ExerciseId, ExerciseId];
  /** Reserved — empty in Week 1, later weeks add intensity techniques. */
  lastSetTechnique: string | null;
};

export type ProgramDay = {
  dayKey: DayKey;
  title: string;
  focusLabel: string;
  estMinutes: { min: number; max: number };
  slots: ProgramSlot[];
};

export const GENERAL_WARMUP =
  "5 min light cardio — any treadmill, bike or elliptical, either floor — plus dynamic stretching.";

export const DAY_ORDER: readonly DayKey[] = [
  "push1",
  "pull1",
  "legs1",
  "push2",
  "pull2",
  "legs2",
];

/** History/progression grain: same exercise in two slots never cross-reads. */
export function progKey(dayKey: DayKey, slot: number, resolvedId: ExerciseId): string {
  return `${dayKey}:${slot}:${resolvedId}`;
}

const rest12 = { min: 60, max: 120 };
const rest23 = { min: 120, max: 180 };
const rest34 = { min: 180, max: 240 };

export const PROGRAM: Record<DayKey, ProgramDay> = {
  push1: {
    dayKey: "push1",
    title: "Push #1",
    focusLabel: "Strength · chest, delts, triceps",
    estMinutes: { min: 45, max: 75 },
    slots: [
      { slot: 0, exerciseId: "machine-chest-press", warmupSets: { min: 2, max: 3 }, workingSets: 3, reps: { min: 6, max: 8 }, rpe: { earlyMin: 7, earlyMax: 8, last: 9 }, restSec: rest23, substitutions: ["bench-press", "flat-db-press"], lastSetTechnique: null },
      { slot: 1, exerciseId: "db-shoulder-press-seated", warmupSets: { min: 1, max: 2 }, workingSets: 3, reps: { min: 8, max: 10 }, rpe: { earlyMin: 7, earlyMax: 8, last: 9 }, restSec: rest23, substitutions: ["overhead-barbell-press", "barbell-upright-row"], lastSetTechnique: null },
      { slot: 2, exerciseId: "pec-deck", warmupSets: { min: 0, max: 1 }, workingSets: 3, reps: { min: 8, max: 10 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["dumbbell-fly", "push-up"], lastSetTechnique: null },
      { slot: 3, exerciseId: "db-lateral-raise", warmupSets: { min: 0, max: 1 }, workingSets: 3, reps: { min: 8, max: 10 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["cable-lateral-raise", "machine-lateral-raise"], lastSetTechnique: null },
      { slot: 4, exerciseId: "ez-skullcrusher", warmupSets: { min: 0, max: 1 }, workingSets: 2, reps: { min: 8, max: 10 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["db-skullcrusher", "overhead-triceps-extension"], lastSetTechnique: null },
      { slot: 5, exerciseId: "triceps-pressdown", warmupSets: { min: 0, max: 1 }, workingSets: 2, reps: { min: 8, max: 10 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["triceps-kickback-cable", "ez-skullcrusher"], lastSetTechnique: null },
    ],
  },
  pull1: {
    dayKey: "pull1",
    title: "Pull #1",
    focusLabel: "Strength · back, rear delts, biceps",
    estMinutes: { min: 45, max: 75 },
    slots: [
      { slot: 0, exerciseId: "chest-supported-t-bar-row", warmupSets: { min: 2, max: 3 }, workingSets: 3, reps: { min: 8, max: 10 }, rpe: { earlyMin: 7, earlyMax: 8, last: 9 }, restSec: rest23, substitutions: ["pendlay-row", "dumbbell-row"], lastSetTechnique: null },
      { slot: 1, exerciseId: "lat-pulldown", warmupSets: { min: 1, max: 2 }, workingSets: 3, reps: { min: 8, max: 10 }, rpe: { earlyMin: 7, earlyMax: 8, last: 9 }, restSec: rest23, substitutions: ["pull-up", "chin-up"], lastSetTechnique: null },
      { slot: 2, exerciseId: "rope-facepull", warmupSets: { min: 0, max: 1 }, workingSets: 3, reps: { min: 8, max: 10 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["reverse-pec-deck", "reverse-cable-fly"], lastSetTechnique: null },
      { slot: 3, exerciseId: "cable-lat-pullover", warmupSets: { min: 0, max: 1 }, workingSets: 3, reps: { min: 8, max: 10 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["db-lat-pullover", "cable-lat-pull-in"], lastSetTechnique: null },
      { slot: 4, exerciseId: "preacher-curl", warmupSets: { min: 0, max: 1 }, workingSets: 2, reps: { min: 8, max: 10 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["ez-biceps-curl", "db-biceps-curl"], lastSetTechnique: null },
      { slot: 5, exerciseId: "ez-biceps-curl", warmupSets: { min: 0, max: 1 }, workingSets: 2, reps: { min: 8, max: 10 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["standing-barbell-curl", "db-biceps-curl"], lastSetTechnique: null },
    ],
  },
  legs1: {
    dayKey: "legs1",
    title: "Legs #1",
    focusLabel: "Strength · hamstrings, quads, calves",
    estMinutes: { min: 50, max: 75 },
    slots: [
      { slot: 0, exerciseId: "romanian-deadlift", warmupSets: { min: 2, max: 3 }, workingSets: 3, reps: { min: 8, max: 10 }, rpe: { earlyMin: 6, earlyMax: 6, last: 7 }, restSec: rest23, substitutions: ["deadlift", "hip-thrust"], lastSetTechnique: null },
      { slot: 1, exerciseId: "leg-press", warmupSets: { min: 2, max: 3 }, workingSets: 3, reps: { min: 6, max: 8 }, rpe: { earlyMin: 7, earlyMax: 7, last: 8 }, restSec: rest34, substitutions: ["barbell-front-squat", "db-lunge"], lastSetTechnique: null },
      { slot: 2, exerciseId: "glute-ham-raise", warmupSets: { min: 1, max: 2 }, workingSets: 2, reps: { min: 8, max: 10 }, rpe: { earlyMin: 7, earlyMax: 7, last: 8 }, restSec: rest23, substitutions: ["back-extension-45", "lying-leg-curl"], lastSetTechnique: null },
      { slot: 3, exerciseId: "seated-calf-raise", warmupSets: { min: 0, max: 1 }, workingSets: 3, reps: { min: 8, max: 10 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["standing-calf-raise", "leg-press-calf-press"], lastSetTechnique: null },
      { slot: 4, exerciseId: "cable-crunch", warmupSets: { min: 0, max: 1 }, workingSets: 3, reps: { min: 10, max: 12 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["decline-situp-weighted", "hanging-leg-raise"], lastSetTechnique: null },
    ],
  },
  push2: {
    dayKey: "push2",
    title: "Push #2",
    focusLabel: "Hypertrophy · delts, chest, triceps",
    estMinutes: { min: 45, max: 75 },
    slots: [
      { slot: 0, exerciseId: "db-shoulder-press-seated", warmupSets: { min: 2, max: 3 }, workingSets: 3, reps: { min: 10, max: 12 }, rpe: { earlyMin: 7, earlyMax: 8, last: 9 }, restSec: rest23, substitutions: ["db-shoulder-press-standing", "overhead-barbell-press"], lastSetTechnique: null },
      { slot: 1, exerciseId: "flat-db-press", warmupSets: { min: 1, max: 2 }, workingSets: 3, reps: { min: 10, max: 12 }, rpe: { earlyMin: 7, earlyMax: 8, last: 9 }, restSec: rest23, substitutions: ["dip", "bench-press"], lastSetTechnique: null },
      { slot: 2, exerciseId: "cable-lateral-raise", warmupSets: { min: 0, max: 1 }, workingSets: 3, reps: { min: 12, max: 15 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["machine-lateral-raise", "db-lateral-raise"], lastSetTechnique: null },
      { slot: 3, exerciseId: "cable-fly", warmupSets: { min: 0, max: 1 }, workingSets: 3, reps: { min: 15, max: 20 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["dumbbell-fly", "pec-deck"], lastSetTechnique: null },
      { slot: 4, exerciseId: "triceps-kickback-cable", warmupSets: { min: 0, max: 1 }, workingSets: 2, reps: { min: 12, max: 15 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["ez-skullcrusher", "triceps-pressdown"], lastSetTechnique: null },
      { slot: 5, exerciseId: "overhead-triceps-extension", warmupSets: { min: 0, max: 1 }, workingSets: 2, reps: { min: 12, max: 15 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["ez-skullcrusher", "db-skullcrusher"], lastSetTechnique: null },
    ],
  },
  pull2: {
    dayKey: "pull2",
    title: "Pull #2",
    focusLabel: "Hypertrophy · back, traps, biceps",
    estMinutes: { min: 45, max: 80 },
    slots: [
      { slot: 0, exerciseId: "lat-pulldown", warmupSets: { min: 1, max: 2 }, workingSets: 3, reps: { min: 10, max: 12 }, rpe: { earlyMin: 7, earlyMax: 8, last: 9 }, restSec: rest23, substitutions: ["pull-up", "chin-up"], lastSetTechnique: null },
      { slot: 1, exerciseId: "dumbbell-row", warmupSets: { min: 1, max: 2 }, workingSets: 3, reps: { min: 10, max: 12 }, rpe: { earlyMin: 7, earlyMax: 8, last: 9 }, restSec: rest23, substitutions: ["chest-supported-t-bar-row", "barbell-row"], lastSetTechnique: null },
      { slot: 2, exerciseId: "cable-lat-pull-in", warmupSets: { min: 0, max: 1 }, workingSets: 3, reps: { min: 10, max: 12 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["cable-lat-pullover", "db-lat-pullover"], lastSetTechnique: null },
      { slot: 3, exerciseId: "reverse-pec-deck", warmupSets: { min: 0, max: 1 }, workingSets: 2, reps: { min: 15, max: 20 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["rope-facepull", "reverse-cable-fly"], lastSetTechnique: null },
      { slot: 4, exerciseId: "barbell-shrug", warmupSets: { min: 0, max: 1 }, workingSets: 2, reps: { min: 12, max: 15 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["db-shrug", "trap-bar-shrug"], lastSetTechnique: null },
      { slot: 5, exerciseId: "hammer-curl", warmupSets: { min: 0, max: 1 }, workingSets: 2, reps: { min: 12, max: 15 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["db-biceps-curl", "ez-biceps-curl"], lastSetTechnique: null },
      { slot: 6, exerciseId: "bayesian-cable-curl", warmupSets: { min: 0, max: 1 }, workingSets: 2, reps: { min: 12, max: 15 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["incline-db-curl", "preacher-curl"], lastSetTechnique: null },
    ],
  },
  legs2: {
    dayKey: "legs2",
    title: "Legs #2",
    focusLabel: "Hypertrophy · quads, hamstrings, abs",
    estMinutes: { min: 55, max: 85 },
    slots: [
      { slot: 0, exerciseId: "leg-press", warmupSets: { min: 2, max: 3 }, workingSets: 3, reps: { min: 8, max: 10 }, rpe: { earlyMin: 7, earlyMax: 7, last: 8 }, restSec: rest34, substitutions: ["barbell-back-squat", "db-lunge"], lastSetTechnique: null },
      { slot: 1, exerciseId: "back-extension-45", warmupSets: { min: 1, max: 2 }, workingSets: 3, reps: { min: 10, max: 12 }, rpe: { earlyMin: 7, earlyMax: 8, last: 9 }, restSec: rest23, substitutions: ["good-morning", "glute-ham-raise"], lastSetTechnique: null },
      { slot: 2, exerciseId: "leg-extension", warmupSets: { min: 1, max: 2 }, workingSets: 2, reps: { min: 12, max: 15 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest23, substitutions: ["goblet-squat", "db-lunge"], lastSetTechnique: null },
      { slot: 3, exerciseId: "seated-leg-curl", warmupSets: { min: 1, max: 2 }, workingSets: 2, reps: { min: 12, max: 15 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest23, substitutions: ["lying-leg-curl", "nordic-ham-curl"], lastSetTechnique: null },
      { slot: 4, exerciseId: "standing-calf-raise", warmupSets: { min: 0, max: 1 }, workingSets: 3, reps: { min: 15, max: 20 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["seated-calf-raise", "leg-press-calf-press"], lastSetTechnique: null },
      { slot: 5, exerciseId: "roman-chair-leg-raise", warmupSets: { min: 0, max: 1 }, workingSets: 3, reps: { min: 10, max: 20 }, rpe: { earlyMin: 9, earlyMax: 9, last: 10 }, restSec: rest12, substitutions: ["hanging-leg-raise", "bent-knee-leg-raise"], lastSetTechnique: null },
    ],
  },
};

/** Total working sets in a day (progress bar + Plan footer). */
export function workingSetCount(day: ProgramDay): number {
  return day.slots.reduce((n, s) => n + s.workingSets, 0);
}

/** "3 × 8–10" (reps.min === reps.max collapses to one number). */
export function formatSetsReps(slot: ProgramSlot): string {
  const r = slot.reps.min === slot.reps.max ? `${slot.reps.min}` : `${slot.reps.min}–${slot.reps.max}`;
  return `${slot.workingSets} × ${r}`;
}

/** "7–8 → 9" (early range collapses when flat). */
export function formatRpe(rpe: RpeTarget): string {
  const early = rpe.earlyMin === rpe.earlyMax ? `${rpe.earlyMin}` : `${rpe.earlyMin}–${rpe.earlyMax}`;
  return `${early} → ${rpe.last}`;
}

/** "2–3 min". */
export function formatRest(restSec: { min: number; max: number }): string {
  return `${restSec.min / 60}–${restSec.max / 60} min`;
}

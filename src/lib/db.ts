/**
 * Dexie schema — the on-device source of truth. version(1) is frozen at
 * first release: schema changes = version(n+1) + upgrade fn, keep every
 * historical version block forever, never change a primary key. Additive
 * row fields need no bump (Dexie rows are schemaless).
 */
import Dexie, { type Table } from "dexie";
import type { ExerciseId } from "./exercises";
import type { DayKey } from "./program";
import { DEFAULT_INCREMENTS } from "./increments";

export type Session = {
  id: string;
  /** IST day identity — string, never a Date. */
  dateKey: string;
  dayKey: DayKey;
  status: "active" | "done";
  startedAt: number;
  finishedAt: number | null;
  /** Session-scoped "station busy" swaps: slot index → performed exercise. */
  swaps: Record<number, ExerciseId>;
  /** General warm-up card dismissed. */
  warmupDone: boolean;
  updatedAt: number;
};

export type SetLog = {
  id: string;
  sessionId: string;
  /** "YYYY-MM" of the session's dateKey — the sync shard (P2). */
  monthKey: string;
  dayKey: DayKey;
  slot: number;
  /** The program's named exercise for the slot. */
  exerciseId: ExerciseId;
  /** What was actually performed (post swap/override/house default). */
  resolvedId: ExerciseId;
  /** `${dayKey}:${slot}:${resolvedId}` — progression/prefill grain. */
  progKey: string;
  setIndex: number;
  kind: "warmup" | "working";
  /** null = pure bodyweight; negative = assistance. */
  weightKg: number | null;
  reps: number;
  rpe: number | null;
  ts: number;
  updatedAt: number;
};

export type Override = {
  exerciseId: ExerciseId;
  performAs: ExerciseId | null;
  stationId: string | null;
  updatedAt: number;
};

export type SettingsRow = {
  id: "settings";
  vibrate: boolean;
  audioCue: boolean;
  reminderHourIst: number | null;
  dumbbellRackKg: number[];
  barbellStepKg: number;
  machineStepKg: number;
  cableStepKg: number;
  /** Remembered rest tweaks, per performed exercise. */
  restOverridesSec: Partial<Record<ExerciseId, number>>;
  /** User-edited machine settings + cues (accrete over time). */
  setupNotes: Partial<Record<ExerciseId, string>>;
  cueOverrides: Partial<Record<ExerciseId, string[]>>;
  onboarded: boolean;
  updatedAt: number;
};

export type ActiveTimer = {
  id: "rest";
  sessionId: string;
  slot: number;
  nextSetIndex: number;
  startedAt: number;
  endsAt: number;
  totalMs: number;
};

export type KV = { key: string; value: unknown };

export const DEFAULT_SETTINGS: SettingsRow = {
  id: "settings",
  vibrate: true,
  audioCue: false,
  reminderHourIst: null,
  dumbbellRackKg: DEFAULT_INCREMENTS.dumbbellRackKg,
  barbellStepKg: DEFAULT_INCREMENTS.barbellStepKg,
  machineStepKg: DEFAULT_INCREMENTS.machineStepKg,
  cableStepKg: DEFAULT_INCREMENTS.cableStepKg,
  restOverridesSec: {},
  setupNotes: {},
  cueOverrides: {},
  onboarded: false,
  updatedAt: 0,
};

class GymDb extends Dexie {
  sessions!: Table<Session, string>;
  setLogs!: Table<SetLog, string>;
  overrides!: Table<Override, string>;
  settings!: Table<SettingsRow, string>;
  timers!: Table<ActiveTimer, string>;
  kv!: Table<KV, string>;
}

let db: GymDb | null = null;

/** Lazy — importing this module during SSR never touches IndexedDB. */
export function getDb(): GymDb {
  if (!db) {
    db = new GymDb("gym");
    db.version(1).stores({
      sessions: "id, dateKey, status",
      setLogs: "id, sessionId, [progKey+ts], [resolvedId+ts], monthKey",
      overrides: "exerciseId",
      settings: "id",
      timers: "id",
      kv: "key",
    });
  }
  return db;
}

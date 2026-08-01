/**
 * The ONLY module that writes to Dexie. One "rw" transaction per
 * mutation; every data write also marks the month dirty for the P2 sync
 * flush. Components call these from event handlers only (React 19
 * StrictMode never double-fires handlers).
 */
import type { ExerciseId } from "./exercises";
import type { DayKey } from "./program";
import { progKey as makeProgKey } from "./program";
import { detectPrs, type PrEvent } from "./e1rm";
import { getDb, DEFAULT_SETTINGS, type ActiveTimer, type Override, type Session, type SetLog, type SettingsRow } from "./db";
import { newId } from "./ids";
import { istToday, monthKeyOf } from "./ist";

async function markDirty(monthKey: string): Promise<void> {
  const db = getDb();
  const row = await db.kv.get("dirtyMonths");
  const set = new Set((row?.value as string[] | undefined) ?? []);
  set.add(monthKey);
  await db.kv.put({ key: "dirtyMonths", value: [...set] });
}

/** Resume the active session if one exists; otherwise start `dayKey`. */
export async function resumeOrStart(dayKey: DayKey): Promise<Session> {
  const db = getDb();
  return db.transaction("rw", db.sessions, async () => {
    const active = await db.sessions.where("status").equals("active").last();
    if (active) return active;
    const session: Session = {
      id: newId(),
      dateKey: istToday(),
      dayKey,
      status: "active",
      startedAt: Date.now(),
      finishedAt: null,
      swaps: {},
      warmupDone: false,
      updatedAt: Date.now(),
    };
    await db.sessions.add(session);
    return session;
  });
}

export type NewSet = {
  sessionId: string;
  dayKey: DayKey;
  slot: number;
  exerciseId: ExerciseId;
  resolvedId: ExerciseId;
  setIndex: number;
  kind: "warmup" | "working";
  weightKg: number | null;
  reps: number;
  rpe: number | null;
};

/** Log a set; returns the row plus any PR events it produced. */
export async function logSet(input: NewSet): Promise<{ set: SetLog; prs: PrEvent[] }> {
  const db = getDb();
  return db.transaction("rw", [db.setLogs, db.sessions, db.kv], async () => {
    const session = await db.sessions.get(input.sessionId);
    if (!session) throw new Error("session-not-found");

    let prs: PrEvent[] = [];
    if (input.kind === "working") {
      const history = await db.setLogs
        .where("[resolvedId+ts]")
        .between([input.resolvedId, -Infinity], [input.resolvedId, Infinity])
        .toArray();
      prs = detectPrs(history, { weightKg: input.weightKg, reps: input.reps });
    }

    const now = Date.now();
    const set: SetLog = {
      id: newId(),
      sessionId: input.sessionId,
      monthKey: monthKeyOf(session.dateKey),
      dayKey: input.dayKey,
      slot: input.slot,
      exerciseId: input.exerciseId,
      resolvedId: input.resolvedId,
      progKey: makeProgKey(input.dayKey, input.slot, input.resolvedId),
      setIndex: input.setIndex,
      kind: input.kind,
      weightKg: input.weightKg,
      reps: input.reps,
      rpe: input.rpe,
      ts: now,
      updatedAt: now,
    };
    await db.setLogs.add(set);
    await markDirty(set.monthKey);
    return { set, prs };
  });
}

/** Edit a logged set; returns any PRs the corrected numbers produce. */
export async function updateSet(
  id: string,
  patch: Partial<Pick<SetLog, "weightKg" | "reps" | "rpe">>,
): Promise<PrEvent[]> {
  const db = getDb();
  return db.transaction("rw", [db.setLogs, db.kv], async () => {
    const row = await db.setLogs.get(id);
    if (!row) return [];
    const next = { ...row, ...patch, updatedAt: Date.now() };
    await db.setLogs.put(next);
    await markDirty(row.monthKey);
    if (next.kind !== "working") return [];
    const history = await db.setLogs
      .where("[resolvedId+ts]")
      .between([row.resolvedId, -Infinity], [row.resolvedId, Infinity])
      .toArray();
    return detectPrs(
      history.filter((h) => h.id !== id),
      { weightKg: next.weightKg, reps: next.reps },
    );
  });
}

export async function deleteSet(id: string): Promise<void> {
  const db = getDb();
  await db.transaction("rw", [db.setLogs, db.kv], async () => {
    const row = await db.setLogs.get(id);
    if (!row) return;
    await db.setLogs.delete(id);
    await markDirty(row.monthKey);
  });
}

/**
 * Swap a slot's exercise for the rest of today. Refused once the slot has
 * working sets — the UI offers "swap for next time" (an override) instead.
 */
export async function setSessionSwap(
  sessionId: string,
  slot: number,
  performAs: ExerciseId | null,
): Promise<void> {
  const db = getDb();
  await db.transaction("rw", [db.sessions, db.setLogs], async () => {
    const session = await db.sessions.get(sessionId);
    if (!session) throw new Error("session-not-found");
    const logged = await db.setLogs
      .where("sessionId")
      .equals(sessionId)
      .filter((s) => s.slot === slot && s.kind === "working")
      .count();
    if (logged > 0) throw new Error("slot-already-logged");
    const swaps = { ...session.swaps };
    if (performAs) swaps[slot] = performAs;
    else delete swaps[slot];
    await db.sessions.put({ ...session, swaps, updatedAt: Date.now() });
  });
}

export async function setWarmupDone(sessionId: string, done: boolean): Promise<void> {
  const db = getDb();
  await db.transaction("rw", db.sessions, async () => {
    const session = await db.sessions.get(sessionId);
    if (!session) return;
    await db.sessions.put({ ...session, warmupDone: done, updatedAt: Date.now() });
  });
}

export type SessionSummary = {
  session: Session;
  durationMs: number;
  workingSets: number;
  totalSets: number;
};

export async function finishSession(id: string): Promise<SessionSummary> {
  const db = getDb();
  return db.transaction("rw", [db.sessions, db.setLogs, db.timers, db.kv], async () => {
    const session = await db.sessions.get(id);
    if (!session) throw new Error("session-not-found");
    const finished: Session = {
      ...session,
      status: "done",
      finishedAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.sessions.put(finished);
    await db.timers.delete("rest");
    await markDirty(monthKeyOf(session.dateKey));
    const sets = await db.setLogs.where("sessionId").equals(id).toArray();
    return {
      session: finished,
      durationMs: (finished.finishedAt ?? 0) - finished.startedAt,
      workingSets: sets.filter((s) => s.kind === "working").length,
      totalSets: sets.length,
    };
  });
}

/** Discard = the session never happened: session + its sets are removed. */
export async function discardSession(id: string): Promise<void> {
  const db = getDb();
  await db.transaction("rw", [db.sessions, db.setLogs, db.timers, db.kv], async () => {
    const session = await db.sessions.get(id);
    if (!session) return;
    await db.setLogs.where("sessionId").equals(id).delete();
    await db.sessions.delete(id);
    await db.timers.delete("rest");
    await markDirty(monthKeyOf(session.dateKey));
  });
}

export async function setOverride(
  exerciseId: ExerciseId,
  patch: { performAs?: ExerciseId | null; stationId?: string | null },
): Promise<void> {
  const db = getDb();
  await db.transaction("rw", db.overrides, async () => {
    const existing = await db.overrides.get(exerciseId);
    const next: Override = {
      exerciseId,
      performAs: patch.performAs !== undefined ? patch.performAs : (existing?.performAs ?? null),
      stationId: patch.stationId !== undefined ? patch.stationId : (existing?.stationId ?? null),
      updatedAt: Date.now(),
    };
    if (next.performAs === null && next.stationId === null) await db.overrides.delete(exerciseId);
    else await db.overrides.put(next);
  });
}

export async function saveSettings(patch: Partial<Omit<SettingsRow, "id">>): Promise<SettingsRow> {
  const db = getDb();
  return db.transaction("rw", db.settings, async () => {
    const current = (await db.settings.get("settings")) ?? DEFAULT_SETTINGS;
    const next: SettingsRow = { ...current, ...patch, id: "settings", updatedAt: Date.now() };
    await db.settings.put(next);
    return next;
  });
}

/** Editable dossier fields (setup note / cues) live in the settings maps. */
export async function saveExerciseMeta(
  exerciseId: ExerciseId,
  patch: { setup?: string; cues?: string[] },
): Promise<void> {
  const db = getDb();
  await db.transaction("rw", db.settings, async () => {
    const current = (await db.settings.get("settings")) ?? DEFAULT_SETTINGS;
    const next: SettingsRow = {
      ...current,
      setupNotes:
        patch.setup !== undefined
          ? { ...current.setupNotes, [exerciseId]: patch.setup }
          : current.setupNotes,
      cueOverrides:
        patch.cues !== undefined
          ? { ...current.cueOverrides, [exerciseId]: patch.cues }
          : current.cueOverrides,
      id: "settings",
      updatedAt: Date.now(),
    };
    await db.settings.put(next);
  });
}

/* ------------------------------------------------------------------ *
 * Rest timer — truth is the persisted endsAt.
 * ------------------------------------------------------------------ */

export async function startRest(
  sessionId: string,
  slot: number,
  nextSetIndex: number,
  seconds: number,
): Promise<void> {
  const now = Date.now();
  const timer: ActiveTimer = {
    id: "rest",
    sessionId,
    slot,
    nextSetIndex,
    startedAt: now,
    endsAt: now + seconds * 1000,
    totalMs: seconds * 1000,
  };
  await getDb().timers.put(timer);
}

export async function extendRest(deltaSeconds: number): Promise<void> {
  const db = getDb();
  await db.transaction("rw", db.timers, async () => {
    const t = await db.timers.get("rest");
    if (!t) return;
    const endsAt = Math.max(Date.now(), t.endsAt + deltaSeconds * 1000);
    await db.timers.put({ ...t, endsAt, totalMs: Math.max(t.totalMs, endsAt - t.startedAt) });
  });
}

export async function clearRest(): Promise<void> {
  await getDb().timers.delete("rest");
}

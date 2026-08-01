/**
 * ALL Dexie reads. Every function returns a Promise designed to be passed
 * to useLiveQuery; components never build queries ad hoc, so index usage
 * stays auditable in one file.
 */
import type { ExerciseId } from "./exercises";
import { getDb, DEFAULT_SETTINGS, type SettingsRow } from "./db";
import type { CompletedSession } from "./schedule";
import type { DoneDay } from "./streak";
import type { HistorySet } from "./prefill";

export function settings(): Promise<SettingsRow> {
  return getDb()
    .settings.get("settings")
    .then((s) => s ?? DEFAULT_SETTINGS);
}

export function activeSession() {
  return getDb().sessions.where("status").equals("active").last();
}

export function sessionById(id: string) {
  return getDb().sessions.get(id);
}

export function sessionSets(sessionId: string) {
  return getDb().setLogs.where("sessionId").equals(sessionId).sortBy("ts");
}

/** Completed sessions as the streak/schedule engines want them. */
export async function doneDays(): Promise<DoneDay[] & CompletedSession[]> {
  const rows = await getDb().sessions.where("status").equals("done").toArray();
  return rows
    .sort((a, b) => (a.dateKey === b.dateKey ? a.startedAt - b.startedAt : a.dateKey < b.dateKey ? -1 : 1))
    .map((r) => ({ dateKey: r.dateKey, dayKey: r.dayKey }));
}

/** Time-ordered history for one progression grain (prefill). */
export async function progHistory(progKey: string, limit = 120): Promise<HistorySet[]> {
  const rows = await getDb()
    .setLogs.where("[progKey+ts]")
    .between([progKey, -Infinity], [progKey, Infinity])
    .reverse()
    .limit(limit)
    .toArray();
  return rows.map((r) => ({
    sessionId: r.sessionId,
    setIndex: r.setIndex,
    kind: r.kind,
    weightKg: r.weightKg,
    reps: r.reps,
    rpe: r.rpe,
    ts: r.ts,
  }));
}

/** Recent sessions of one performed exercise (detail-sheet history strip). */
export async function recentExerciseSessions(
  resolvedId: ExerciseId,
  sessionCount = 3,
): Promise<{ sessionId: string; dateKey: string; sets: HistorySet[] }[]> {
  const db = getDb();
  const rows = await db.setLogs
    .where("[resolvedId+ts]")
    .between([resolvedId, -Infinity], [resolvedId, Infinity])
    .reverse()
    .limit(200)
    .toArray();
  const bySession = new Map<string, typeof rows>();
  for (const r of rows) {
    if (r.kind !== "working") continue;
    if (!bySession.has(r.sessionId)) {
      if (bySession.size === sessionCount) break;
      bySession.set(r.sessionId, []);
    }
    bySession.get(r.sessionId)!.push(r);
  }
  const out: { sessionId: string; dateKey: string; sets: HistorySet[] }[] = [];
  for (const [sessionId, sets] of bySession) {
    const session = await db.sessions.get(sessionId);
    out.push({
      sessionId,
      dateKey: session?.dateKey ?? "",
      sets: sets
        .sort((a, b) => a.setIndex - b.setIndex)
        .map((r) => ({
          sessionId: r.sessionId,
          setIndex: r.setIndex,
          kind: r.kind,
          weightKg: r.weightKg,
          reps: r.reps,
          rpe: r.rpe,
          ts: r.ts,
        })),
    });
  }
  return out;
}

export function overrideFor(exerciseId: ExerciseId) {
  return getDb().overrides.get(exerciseId);
}

export function allOverrides() {
  return getDb().overrides.toArray();
}

export function restTimer() {
  return getDb().timers.get("rest");
}

/** Total volume (Σ weight×reps, honoring null weights) for a session. */
export async function sessionVolumeKg(
  sessionId: string,
  volumeFactorOf: (id: ExerciseId) => 1 | 2,
): Promise<number> {
  const sets = await getDb().setLogs.where("sessionId").equals(sessionId).toArray();
  return sets.reduce((sum, s) => {
    if (s.kind !== "working" || s.weightKg == null || s.weightKg <= 0) return sum;
    return sum + s.weightKg * s.reps * volumeFactorOf(s.resolvedId);
  }, 0);
}

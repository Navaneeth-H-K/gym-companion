"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "motion/react";
import { EllipsisVertical, Wind, X, Zap, ZapOff } from "lucide-react";
import type { SetDraft } from "@/components/active-set-card";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { ExerciseCard } from "@/components/exercise-card";
import { ExerciseDetailSheet } from "@/components/exercise-detail-sheet";
import { FinishSummary, type PrRecord } from "@/components/finish-summary";
import { RestDock } from "@/components/rest-dock";
import { Sheet } from "@/components/sheet";
import { SwapSheet } from "@/components/swap-sheet";
import { Toast, type ToastData } from "@/components/toast";
import { useRestTimer } from "@/components/use-rest-timer";
import { useWakeLock } from "@/components/use-wake-lock";
import { EXERCISES, type ExerciseId } from "@/lib/exercises";
import { haptic } from "@/lib/haptics";
import { DEFAULT_INCREMENTS } from "@/lib/increments";
import { istToday } from "@/lib/ist";
import { GENERAL_WARMUP, PROGRAM, progKey, workingSetCount } from "@/lib/program";
import type { HistorySet } from "@/lib/prefill";
import {
  clearRest,
  deleteSet,
  discardSession,
  extendRest,
  finishSession,
  logSet,
  saveSettings,
  setOverride,
  setSessionSwap,
  setWarmupDone,
  startRest,
  updateSet,
} from "@/lib/repo";
import { defaultRestSec } from "@/lib/resttimer";
import {
  allOverrides,
  doneDays,
  progHistory,
  sessionById,
  sessionSets,
  sessionVolumeKg,
  settings,
} from "@/lib/selectors";
import { resolveExercise } from "@/lib/stations";
import { computeStreak } from "@/lib/streak";
import { cn } from "@/lib/utils";

type SummaryData = {
  durationMs: number;
  workingSets: number;
  volumeKg: number;
};

export default function WorkoutPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const session = useLiveQuery(
    async () => (sessionId ? ((await sessionById(sessionId)) ?? null) : null),
    [sessionId],
  );
  const sets = useLiveQuery(
    async () => (sessionId ? await sessionSets(sessionId) : []),
    [sessionId],
  );
  const overridesRows = useLiveQuery(allOverrides, []);
  const overrides = useMemo(() => overridesRows ?? [], [overridesRows]);
  const settingsRow = useLiveQuery(settings, []);
  const days = useLiveQuery(doneDays, []);
  const timerState = useRestTimer();
  const wake = useWakeLock(session?.status === "active");

  const [manualSlot, setManualSlot] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [swapSlot, setSwapSlot] = useState<number | null>(null);
  const [detailSlot, setDetailSlot] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [finishEarlyOpen, setFinishEarlyOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [prRecords, setPrRecords] = useState<PrRecord[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  const day = session ? PROGRAM[session.dayKey] : null;

  const resolvedBySlot = useMemo(() => {
    if (!day || !session) return [];
    return day.slots.map((slot) =>
      resolveExercise(
        slot.exerciseId,
        overrides.find((o) => o.exerciseId === slot.exerciseId),
        session.swaps[slot.slot] ?? null,
      ),
    );
  }, [day, session, overrides]);

  const histories = useLiveQuery(async () => {
    if (!session) return {};
    const d = PROGRAM[session.dayKey];
    const out: Record<number, HistorySet[]> = {};
    for (const slot of d.slots) {
      const r = resolveExercise(
        slot.exerciseId,
        overrides.find((o) => o.exerciseId === slot.exerciseId),
        session.swaps[slot.slot] ?? null,
      );
      out[slot.slot] = await progHistory(progKey(session.dayKey, slot.slot, r.performAs));
    }
    return out;
  }, [session, overrides]);

  const allSets = useMemo(() => sets ?? [], [sets]);
  const workingBySlot = useMemo(() => {
    const map = new Map<number, typeof allSets>();
    for (const s of allSets) {
      if (s.kind !== "working") continue;
      const list = map.get(s.slot) ?? [];
      list.push(s);
      map.set(s.slot, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.setIndex - b.setIndex);
    return map;
  }, [allSets]);
  const warmupsBySlot = useMemo(() => {
    const map = new Map<number, typeof allSets>();
    for (const s of allSets) {
      if (s.kind !== "warmup") continue;
      const list = map.get(s.slot) ?? [];
      list.push(s);
      map.set(s.slot, list);
    }
    return map;
  }, [allSets]);

  const totalWorking = day ? workingSetCount(day) : 0;
  const workingLogged = allSets.filter((s) => s.kind === "working").length;
  const allDone = day != null && workingLogged >= totalWorking;

  const autoSlot = useMemo(() => {
    if (!day) return 0;
    const open = day.slots.find((s) => (workingBySlot.get(s.slot)?.length ?? 0) < s.workingSets);
    return open?.slot ?? day.slots[day.slots.length - 1].slot;
  }, [day, workingBySlot]);
  const expandedSlot = manualSlot ?? autoSlot;

  const prSetIds = useMemo(() => new Set(prRecords.map((p) => p.setId)), [prRecords]);

  // Stale/foreign links bounce home (but never while the summary is up).
  useEffect(() => {
    if (session === null && !summary) router.replace("/today");
  }, [session, summary, router]);

  if (!session || !day || sets === undefined) {
    return (
      <div className="px-5 pt-6 safe-top">
        <div className="skeleton h-10 w-full rounded-[12px]" />
        <div className="skeleton mt-4 h-64 w-full rounded-[24px]" />
        <div className="skeleton mt-3 h-14 w-full rounded-[16px]" />
      </div>
    );
  }

  const doLog = async (slotIdx: number, draft: SetDraft, setIndex: number) => {
    const slot = day.slots[slotIdx];
    const r = resolvedBySlot[slotIdx];
    const { set, prs } = await logSet({
      sessionId: session.id,
      dayKey: session.dayKey,
      slot: slot.slot,
      exerciseId: slot.exerciseId,
      resolvedId: r.performAs,
      setIndex,
      kind: "working",
      weightKg: draft.weightKg,
      reps: draft.reps,
      rpe: draft.rpe,
    });
    haptic("setDone");
    if (prs.length > 0) {
      haptic("pr");
      setPrRecords((prev) => [
        ...prev,
        ...prs.map((event) => ({ setId: set.id, name: EXERCISES[r.performAs].name, event })),
      ]);
    }
    const isSlotDone = setIndex + 1 >= slot.workingSets;
    if (isSlotDone) setManualSlot(null);
    const isSessionDone = workingLogged + 1 >= totalWorking;
    if (!isSessionDone) {
      const restSec =
        settingsRow?.restOverridesSec[r.performAs] ?? defaultRestSec(slot.restSec);
      await startRest(session.id, slot.slot, setIndex + 1, restSec);
    }
  };

  const doLogWarmup = async (slotIdx: number, setIndex: number, weightKg: number, reps: number) => {
    const slot = day.slots[slotIdx];
    const r = resolvedBySlot[slotIdx];
    haptic("select");
    await logSet({
      sessionId: session.id,
      dayKey: session.dayKey,
      slot: slot.slot,
      exerciseId: slot.exerciseId,
      resolvedId: r.performAs,
      setIndex,
      kind: "warmup",
      weightKg,
      reps,
      rpe: null,
    });
  };

  const doSaveEdit = async (id: string, draft: SetDraft) => {
    const prs = await updateSet(id, draft);
    setEditingId(null);
    haptic("select");
    if (prs.length > 0) haptic("pr");
  };

  const doSwap = async (slotIdx: number, performAs: ExerciseId) => {
    try {
      await setSessionSwap(session.id, slotIdx, performAs);
      setSwapSlot(null);
      setToast({
        id: Date.now(),
        message: `Swapped to ${EXERCISES[performAs].name} for today`,
        actionLabel: "Undo",
        onAction: () => void setSessionSwap(session.id, slotIdx, null),
      });
    } catch {
      setSwapSlot(null);
    }
  };

  const doOverride = async (slotIdx: number, performAs: ExerciseId) => {
    const slot = day.slots[slotIdx];
    await setOverride(slot.exerciseId, { performAs });
    setSwapSlot(null);
    setToast({
      id: Date.now(),
      message: `${EXERCISES[performAs].name} is now your version`,
      actionLabel: "Undo",
      onAction: () => void setOverride(slot.exerciseId, { performAs: null }),
    });
  };

  const doExtendRest = async (sec: number) => {
    await extendRest(sec);
    const t = timerState.timer;
    if (!t || !settingsRow) return;
    const r = resolvedBySlot[t.slot];
    if (!r) return;
    const remembered = Math.max(30, Math.round((t.endsAt + sec * 1000 - t.startedAt) / 1000));
    await saveSettings({
      restOverridesSec: { ...settingsRow.restOverridesSec, [r.performAs]: remembered },
    });
  };

  const doFinish = async () => {
    const result = await finishSession(session.id);
    const volumeKg = await sessionVolumeKg(session.id, (id) => EXERCISES[id].volumeFactor);
    setSummary({ durationMs: result.durationMs, workingSets: result.workingSets, volumeKg });
  };

  const handleClose = () => {
    if (allSets.length === 0) {
      void discardSession(session.id);
      router.replace("/today");
      return;
    }
    setCloseOpen(true);
  };

  const timerSlot = timerState.timer ? day.slots[timerState.timer.slot] : null;
  const timerResolved = timerState.timer ? resolvedBySlot[timerState.timer.slot] : null;
  const nextLabel =
    timerSlot && timerResolved && timerState.timer
      ? `next: ${EXERCISES[timerResolved.performAs].name} · set ${timerState.timer.nextSetIndex + 1}`
      : "next set";

  const streakAfter = computeStreak(days ?? [], istToday());

  return (
    <div className="flex min-h-dvh flex-col">
      {/* sticky header */}
      <div className="sticky top-0 z-30 bg-bg safe-top">
        <div className="flex h-12 items-center justify-between px-3">
          <button
            aria-label="Close workout"
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center text-fg-muted"
          >
            <X size={20} />
          </button>
          <div className="text-center">
            <div className="overline-label text-fg-muted">{day.title}</div>
            <div className="tnum text-[11px] leading-[14px] text-fg-faint">
              Set {workingLogged}/{totalWorking}
            </div>
          </div>
          <div className="flex items-center">
            <span
              className="flex h-11 w-9 items-center justify-center"
              title={wake.held ? "Screen staying awake" : "Screen may sleep"}
            >
              {wake.held ? (
                <Zap size={14} className="text-accent-2" />
              ) : (
                <ZapOff size={14} className="text-fg-faint" />
              )}
            </span>
            <button
              aria-label="Workout options"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center text-fg-muted"
            >
              <EllipsisVertical size={20} />
            </button>
          </div>
        </div>
        {/* per-exercise progress bar */}
        <div className="flex gap-0.5 px-3 pb-2">
          {day.slots.map((slot) => {
            const done = workingBySlot.get(slot.slot)?.length ?? 0;
            const pct = Math.min(100, (done / slot.workingSets) * 100);
            const current = slot.slot === expandedSlot;
            return (
              <button
                key={slot.slot}
                aria-label={`Go to exercise ${slot.slot + 1}`}
                onClick={() => {
                  setManualSlot(slot.slot);
                  setEditingId(null);
                }}
                className={cn("h-3 rounded-full py-1", current ? "opacity-100" : "opacity-55")}
                style={{ flexGrow: slot.workingSets }}
              >
                <span className="block h-1 w-full overflow-hidden rounded-full bg-bg-2">
                  <span
                    className="block h-full rounded-full bg-accent transition-[width] duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* body */}
      <div className={cn("flex flex-col gap-2 px-3 pt-2", timerState.timer || allDone ? "pb-44" : "pb-24")}>
        {!session.warmupDone && (
          <motion.div
            layout
            className="rounded-[20px] border border-accent-2/25 bg-accent-2-dim p-4"
          >
            <div className="flex items-center gap-2">
              <Wind size={16} className="text-accent-2" />
              <span className="overline-label text-accent-2">general warm-up</span>
            </div>
            <p className="mt-2 text-[15px] leading-[22px] text-fg-muted">{GENERAL_WARMUP}</p>
            <button
              onClick={() => void setWarmupDone(session.id, true)}
              className="mt-3 h-11 w-full rounded-[12px] bg-bg-2 text-[15px] font-semibold text-accent-2"
            >
              Done
            </button>
          </motion.div>
        )}

        {day.slots.map((slot) => (
          <ExerciseCard
            key={slot.slot}
            sessionId={session.id}
            slot={slot}
            index={slot.slot}
            expanded={slot.slot === expandedSlot}
            onToggle={() => {
              setManualSlot(slot.slot);
              setEditingId(null);
            }}
            resolved={resolvedBySlot[slot.slot]}
            history={histories?.[slot.slot] ?? []}
            warmups={warmupsBySlot.get(slot.slot) ?? []}
            working={workingBySlot.get(slot.slot) ?? []}
            isFirstLift={slot.slot === 0}
            prSetIds={prSetIds}
            incrementSettings={settingsRow ?? DEFAULT_INCREMENTS}
            restOverrideSec={
              settingsRow?.restOverridesSec[resolvedBySlot[slot.slot]?.performAs as ExerciseId]
            }
            editingId={editingId}
            onEditStart={setEditingId}
            onLog={(draft, setIndex) => void doLog(slot.slot, draft, setIndex)}
            onSaveEdit={(id, draft) => void doSaveEdit(id, draft)}
            onDeleteSet={(id) => {
              setEditingId(null);
              void deleteSet(id);
            }}
            onLogWarmup={(setIndex, w, r) => void doLogWarmup(slot.slot, setIndex, w, r)}
            onBusy={() => setSwapSlot(slot.slot)}
            onDetail={() => setDetailSlot(slot.slot)}
          />
        ))}
      </div>

      {/* finish CTA replaces the dock once everything is logged */}
      <AnimatePresence>
        {allDone && !summary && (
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md bg-bg px-5 py-4 safe-bottom"
          >
            <button
              onClick={() => void doFinish()}
              className="h-[60px] w-full rounded-[16px] bg-accent text-[16px] font-semibold text-accent-ink"
            >
              Finish workout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!allDone && (
        <RestDock
          state={timerState}
          nextLabel={nextLabel}
          onSkip={() => void clearRest()}
          onExtend={(sec) => void doExtendRest(sec)}
        />
      )}

      {/* sheets */}
      {swapSlot != null && (
        <SwapSheet
          open
          onClose={() => setSwapSlot(null)}
          slot={day.slots[swapSlot]}
          resolved={resolvedBySlot[swapSlot]}
          locked={(workingBySlot.get(swapSlot)?.length ?? 0) > 0}
          onSwap={(p) => void doSwap(swapSlot, p)}
          onOverride={(p) => void doOverride(swapSlot, p)}
        />
      )}

      {detailSlot != null && (
        <ExerciseDetailSheet
          open
          onClose={() => setDetailSlot(null)}
          performAs={resolvedBySlot[detailSlot].performAs}
          station={resolvedBySlot[detailSlot].station}
          slot={day.slots[detailSlot]}
          houseNote={resolvedBySlot[detailSlot].houseNote}
        />
      )}

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Workout options">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setMenuOpen(false);
              if (allDone) void doFinish();
              else setFinishEarlyOpen(true);
            }}
            className="h-14 rounded-[16px] bg-bg-2 text-[15px] font-semibold"
          >
            Finish {allDone ? "workout" : "early"}
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              setDiscardOpen(true);
            }}
            className="h-14 rounded-[16px] bg-bg-2 text-[15px] font-semibold text-danger"
          >
            Discard workout
          </button>
        </div>
      </Sheet>

      <Sheet open={finishEarlyOpen} onClose={() => setFinishEarlyOpen(false)} title="Finish early?">
        <p className="mb-4 text-[15px] leading-[22px] text-fg-muted">
          {totalWorking - workingLogged} working sets unlogged. The session saves as-is and still
          counts for the streak.
        </p>
        <button
          onClick={() => {
            setFinishEarlyOpen(false);
            void doFinish();
          }}
          className="h-14 w-full rounded-[16px] bg-accent text-[15px] font-semibold text-accent-ink"
        >
          Finish &amp; save
        </button>
      </Sheet>

      <Sheet open={closeOpen} onClose={() => setCloseOpen(false)} title="Pause workout?">
        <p className="mb-4 text-[15px] leading-[22px] text-fg-muted">
          Progress is saved — resume from Today whenever.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.replace("/today")}
            className="h-14 rounded-[16px] bg-accent text-[15px] font-semibold text-accent-ink"
          >
            Pause &amp; leave
          </button>
          <button
            onClick={() => {
              setCloseOpen(false);
              setDiscardOpen(true);
            }}
            className="h-14 rounded-[16px] bg-bg-2 text-[15px] font-semibold text-danger"
          >
            Discard workout
          </button>
        </div>
      </Sheet>

      <ConfirmSheet
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard this workout?"
        body="Its logged sets are deleted — as if it never happened."
        confirmLabel="Discard workout"
        onConfirm={() => {
          setDiscardOpen(false);
          void discardSession(session.id).then(() => router.replace("/today"));
        }}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} anchor="top" />

      {summary && (
        <FinishSummary
          dayTitle={day.title}
          durationMs={summary.durationMs}
          workingSets={summary.workingSets}
          totalWorkingTarget={totalWorking}
          volumeKg={summary.volumeKg}
          prs={prRecords}
          streakCurrent={streakAfter.current}
          onDone={() => router.replace("/today")}
        />
      )}
    </div>
  );
}

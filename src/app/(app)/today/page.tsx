"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "motion/react";
import { CloudOff, EllipsisVertical, Moon } from "lucide-react";
import { ConfirmSheet } from "@/components/confirm-sheet";
import { DayPickerSheet } from "@/components/day-picker-sheet";
import { Onboarding } from "@/components/onboarding";
import { Ring } from "@/components/ring";
import { Sheet } from "@/components/sheet";
import { StationPhoto } from "@/components/station-photo";
import { WeekStrip } from "@/components/week-strip";
import { haptic } from "@/lib/haptics";
import { humanDate, istToday } from "@/lib/ist";
import { fadeUp, stagger } from "@/lib/motion";
import { PROGRAM, type DayKey } from "@/lib/program";
import { discardSession, resumeOrStart, saveSettings } from "@/lib/repo";
import { todaysPlan } from "@/lib/schedule";
import { activeSession, allOverrides, doneDays, sessionSets, settings } from "@/lib/selectors";
import { resolveExercise } from "@/lib/stations";
import { computeStreak } from "@/lib/streak";

/** Wall clock quantized to the half-minute — stable between ticks, so it's
 *  a legal external-store snapshot. */
function useCoarseNow(): number {
  return useSyncExternalStore(
    (cb) => {
      const id = setInterval(cb, 30_000);
      return () => clearInterval(id);
    },
    () => Math.floor(Date.now() / 30_000) * 30_000,
    () => 0,
  );
}

function useOnline(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}

export default function TodayPage() {
  const router = useRouter();
  const online = useOnline();
  const days = useLiveQuery(doneDays, []);
  const active = useLiveQuery(activeSession, []);
  const activeSets = useLiveQuery(
    async () => (active?.id ? await sessionSets(active.id) : null),
    [active?.id],
  );
  const overrides = useLiveQuery(allOverrides, []);
  const settingsRow = useLiveQuery(settings, []);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const today = istToday();
  const loading = days === undefined;
  const streak = useMemo(() => computeStreak(days ?? [], today), [days, today]);
  const plan = useMemo(() => todaysPlan(days ?? [], today), [days, today]);

  const day = PROGRAM[plan.dayKey];
  const firstSlot = day.slots[0];
  const firstResolved = resolveExercise(
    firstSlot.exerciseId,
    overrides?.find((o) => o.exerciseId === firstSlot.exerciseId),
  );
  const floors = useMemo(() => {
    const set = new Set<number>();
    for (const slot of day.slots) {
      const r = resolveExercise(slot.exerciseId, overrides?.find((o) => o.exerciseId === slot.exerciseId));
      if (r.station) set.add(r.station.floor);
    }
    return [...set].sort().map((f) => `F${f}`).join(" + ") || "?";
  }, [day, overrides]);

  const start = async (dayKey: DayKey) => {
    haptic("select");
    const session = await resumeOrStart(dayKey);
    router.push(`/workout/${session.id}`);
  };

  const now = useCoarseNow();
  const workingLogged = activeSets?.filter((s) => s.kind === "working").length ?? 0;
  const activeMinutes = active && now ? Math.max(1, Math.round((now - active.startedAt) / 60000)) : 0;
  const stale = active && now ? now - active.startedAt > 6 * 3600_000 : false;

  if (loading) {
    return (
      <div className="px-5 pt-4 safe-top">
        <div className="skeleton h-4 w-28 rounded-[8px]" />
        <div className="skeleton mx-auto mt-8 h-[220px] w-[220px] rounded-full" />
        <div className="skeleton mt-8 h-[128px] w-full rounded-[28px]" />
        <div className="skeleton mt-6 h-10 w-full rounded-[16px]" />
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 pt-4 safe-top">
      {/* status row */}
      <motion.div variants={fadeUp} className="flex h-8 items-center justify-between">
        <span className="overline-label text-fg-faint">{humanDate(today)}</span>
        {!online && <CloudOff size={16} className="text-fg-faint" />}
      </motion.div>

      {/* ring hero */}
      <motion.button variants={fadeUp} className="mt-4 block w-full" onClick={() => setInfoOpen(true)}>
        <Ring
          cycleDone={streak.cycleDone}
          streak={streak.current}
          freezeTokens={streak.freezeTokens}
          doneToday={streak.doneToday}
        />
      </motion.button>

      {/* session card */}
      <motion.div variants={fadeUp} className="mt-6 rounded-[28px] bg-bg-1 p-4">
        {active ? (
          <>
            <div className="overline-label text-accent">In progress · {PROGRAM[active.dayKey].title}</div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <h1 className="font-display text-[30px] font-semibold leading-[34px]">
                {PROGRAM[active.dayKey].title}
              </h1>
              <StationPhoto station={firstResolved.station} size={64} />
            </div>
            {stale && (
              <p className="mt-2 text-[13px] leading-[18px] text-fg-muted">
                Still going? Finish &amp; save from inside the workout, or discard it here.
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => router.push(`/workout/${active.id}`)}
                className="h-14 flex-1 rounded-[16px] bg-accent text-[16px] font-semibold text-accent-ink"
              >
                Resume — {workingLogged} sets · {activeMinutes} min
              </button>
              <button
                aria-label="Session options"
                onClick={() => setDiscardOpen(true)}
                className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-line-strong text-fg-muted"
              >
                <EllipsisVertical size={20} />
              </button>
            </div>
          </>
        ) : plan.suggestion === "rest" ? (
          <>
            <div className="flex items-center gap-2">
              <Moon size={18} className="text-accent-2" />
              <span className="overline-label text-accent-2">Rest day</span>
            </div>
            <h1 className="mt-1 font-display text-[30px] font-semibold leading-[34px]">
              You&apos;ve earned it
            </h1>
            <p className="mt-2 text-[15px] leading-[22px] text-fg-muted">
              Cycle complete. Tomorrow: {day.title} — {day.focusLabel}.
            </p>
            <button
              onClick={() => setPickerOpen(true)}
              className="mt-4 h-14 w-full rounded-[16px] border border-line-strong text-[15px] font-semibold text-fg-muted"
            >
              Train anyway
            </button>
          </>
        ) : plan.suggestion === "done" ? (
          <>
            <div className="overline-label text-accent">Done today · {PROGRAM[plan.doneToday!].title}</div>
            <h1 className="mt-1 font-display text-[30px] font-semibold leading-[34px]">
              Session banked
            </h1>
            <p className="mt-2 text-[15px] leading-[22px] text-fg-muted">
              Next up: {day.title} — {day.focusLabel}.
            </p>
            <button
              onClick={() => setPickerOpen(true)}
              className="mt-4 h-14 w-full rounded-[16px] border border-line-strong text-[15px] font-semibold text-fg-muted"
            >
              Go again
            </button>
          </>
        ) : (
          <>
            <div className="overline-label text-accent">Next up · {day.title}</div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-[30px] font-semibold leading-[34px]">{day.title}</h1>
                <p className="mt-1 text-[13px] leading-[18px] text-fg-muted">
                  {day.slots.length} exercises · ~{day.estMinutes.min}–{day.estMinutes.max} min · {floors}
                </p>
              </div>
              <StationPhoto station={firstResolved.station} size={72} />
            </div>
            <button
              onClick={() => start(plan.dayKey)}
              className="mt-4 h-14 w-full rounded-[16px] bg-accent text-[16px] font-semibold text-accent-ink active:scale-[0.97]"
            >
              Start workout
            </button>
            <button
              onClick={() => setPickerOpen(true)}
              className="mt-2 h-10 w-full text-[13px] font-medium text-fg-faint"
            >
              Not this one?
            </button>
          </>
        )}
      </motion.div>

      {/* trailing 7 days */}
      <motion.div variants={fadeUp} className="mt-6">
        <WeekStrip
          trainedDates={new Set((days ?? []).map((d) => d.dateKey))}
          frozenDates={new Set(streak.frozenDates)}
          todayKey={today}
        />
      </motion.div>

      <DayPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        cycleDone={streak.cycleDone}
        suggested={plan.dayKey}
        onPick={(dayKey) => {
          setPickerOpen(false);
          void start(dayKey);
        }}
      />

      <ConfirmSheet
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard this workout?"
        body="Its logged sets are deleted — as if it never happened. This can't be undone."
        confirmLabel="Discard workout"
        onConfirm={() => {
          setDiscardOpen(false);
          if (active) void discardSession(active.id);
        }}
      />

      {settingsRow && !settingsRow.onboarded && (
        <Onboarding onDone={() => void saveSettings({ onboarded: true })} />
      )}

      <Sheet open={infoOpen} onClose={() => setInfoOpen(false)} title="How the streak works">
        <div className="flex flex-col gap-3 text-[15px] leading-[22px] text-fg-muted">
          <p>
            The ring is your current cycle — six sessions, in any order, on any days. Finish all six
            and it resets for the next round.
          </p>
          <p>
            The streak counts training days. One rest day in any rolling 7 is free (that&apos;s the
            program). A second rest day auto-spends a freeze <span className="text-accent-2">❄</span>;
            without one, the streak resets.
          </p>
          <p>Earn a freeze each time you complete 6 sessions within 7 days. You can hold two.</p>
        </div>
      </Sheet>
    </motion.div>
  );
}

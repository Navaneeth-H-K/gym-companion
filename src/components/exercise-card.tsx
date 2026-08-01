"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronDown, Trophy, Users } from "lucide-react";
import type { SetLog } from "@/lib/db";
import { EXERCISES } from "@/lib/exercises";
import { profileFor, type IncrementSettings } from "@/lib/increments";
import { easeOutExpo, springGentle } from "@/lib/motion";
import { formatRest, formatRpe, formatSetsReps, type ProgramSlot } from "@/lib/program";
import { lastSessionWorkingSets, lastTimeSummary, prefillFor, type HistorySet } from "@/lib/prefill";
import type { RpeValue } from "@/lib/rpe";
import type { ResolvedExercise } from "@/lib/stations";
import { warmupCount, warmupLadder } from "@/lib/warmup";
import { cn } from "@/lib/utils";
import { ActiveSetCard, type SetDraft } from "./active-set-card";
import { FloorChip } from "./floor-chip";
import { StationPhoto } from "./station-photo";

function CheckDraw({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-[1.25rem] w-[1.25rem]", className)}
      aria-hidden
    >
      <motion.path
        d="M5 13l4 4L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.2, ease: easeOutExpo }}
      />
    </svg>
  );
}

function fmtW(w: number | null): string {
  if (w == null || w === 0) return "BW";
  const abs = Math.abs(w);
  const s = abs % 1 === 0 ? String(abs) : abs.toFixed(1);
  return w < 0 ? `−${s}` : `${s} kg`;
}

/**
 * One accordion item: collapsed 56px summary row, or the full exercise
 * card — station block, target line, "last time", warm-up disclosure
 * (ladder off the live stepper value), and the set rows with exactly one
 * active editor.
 */
export function ExerciseCard({
  sessionId,
  slot,
  index,
  expanded,
  onToggle,
  resolved,
  history,
  warmups,
  working,
  isFirstLift,
  prSetIds,
  incrementSettings,
  restOverrideSec,
  editingId,
  onEditStart,
  onLog,
  onSaveEdit,
  onDeleteSet,
  onLogWarmup,
  onBusy,
  onDetail,
}: {
  sessionId: string;
  slot: ProgramSlot;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  resolved: ResolvedExercise;
  history: HistorySet[];
  warmups: SetLog[];
  working: SetLog[];
  isFirstLift: boolean;
  prSetIds: Set<string>;
  incrementSettings: IncrementSettings;
  restOverrideSec?: number;
  editingId: string | null;
  onEditStart: (id: string | null) => void;
  onLog: (draft: SetDraft, setIndex: number) => void;
  onSaveEdit: (id: string, draft: SetDraft) => void;
  onDeleteSet: (id: string) => void;
  onLogWarmup: (setIndex: number, weightKg: number, reps: number) => void;
  onBusy: () => void;
  onDetail: () => void;
}) {
  const info = EXERCISES[resolved.performAs];
  const profile = profileFor(info.equipment, info.loadType, incrementSettings);
  // Prefill carries forward within the session (set 2 inherits set 1), while
  // the "Last:" line only ever describes a previous session.
  const lastSets = useMemo(() => lastSessionWorkingSets(history), [history]);
  const priorSets = useMemo(
    () => lastSessionWorkingSets(history.filter((h) => h.sessionId !== sessionId)),
    [history, sessionId],
  );
  const done = working.length >= slot.workingSets;
  const nextIndex = working.length;
  const [warmupOpen, setWarmupOpen] = useState(false);

  const firstPrefill = prefillFor(0, lastSets, slot.reps.min);
  const [liveWeight, setLiveWeight] = useState<number | null>(null);
  const ladderBase = liveWeight ?? firstPrefill.weightKg;
  const wuCount = warmupCount(slot.warmupSets, isFirstLift);
  const ladder = warmupLadder(ladderBase, wuCount, profile);
  const lastLine = lastTimeSummary(priorSets);

  /* ---------------------------------------------------- collapsed row */
  if (!expanded) {
    return (
      <motion.button
        layout
        transition={springGentle}
        onClick={onToggle}
        className="flex h-14 w-full items-center gap-3 rounded-[1rem] bg-bg-1 px-4 text-left"
      >
        <span className="tnum w-5 text-[0.8125rem] text-fg-faint">{index + 1}</span>
        <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold">{info.name}</span>
        <FloorChip station={resolved.station} />
        <span className={cn("tnum text-[0.8125rem]", done ? "text-accent" : "text-fg-faint")}>
          {working.length}/{slot.workingSets}
        </span>
        {done ? <Check size="1rem" className="text-accent" /> : <ChevronDown size="1rem" className="text-fg-faint" />}
      </motion.button>
    );
  }

  /* ----------------------------------------------------- expanded card */
  return (
    <motion.div layout transition={springGentle} className="rounded-[1.5rem] bg-bg-1 p-4">
      {/* station block */}
      <div className="flex items-center gap-3">
        <button onClick={onDetail} aria-label="Exercise details">
          <StationPhoto station={resolved.station} size={72} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <FloorChip station={resolved.station} />
            <span className="truncate text-[0.9375rem] font-semibold">
              {resolved.station?.name ?? "location unknown"}
            </span>
          </div>
          {resolved.station && (
            <p className="mt-0.5 line-clamp-2 text-[0.8125rem] leading-[1.125rem] text-fg-faint">
              {resolved.station.howToFind}
            </p>
          )}
        </div>
        <button
          onClick={onBusy}
          className="flex h-14 w-16 flex-col items-center justify-center gap-0.5 rounded-[0.75rem] border border-line-strong text-fg-muted"
        >
          <Users size="1rem" />
          <span className="text-[0.6875rem] font-medium">Busy?</span>
        </button>
      </div>

      {/* title + prescription */}
      <button onClick={onDetail} className="mt-3 block text-left">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-[1.5rem] font-semibold leading-[1.75rem]">{info.name}</h2>
          {resolved.source === "swap" && (
            <span className="overline-label shrink-0 rounded-[0.5rem] bg-accent-dim px-1.5 py-0.5 text-accent">
              today only
            </span>
          )}
          {resolved.source === "house" && (
            <span className="overline-label shrink-0 rounded-[0.5rem] bg-bg-2 px-1.5 py-0.5 text-fg-faint">
              house
            </span>
          )}
        </div>
        <p className="tnum mt-1 text-[0.8125rem] text-fg-muted">
          {formatSetsReps(slot)} @ RPE {formatRpe(slot.rpe)} · rest{" "}
          {restOverrideSec ? `${Math.round(restOverrideSec / 60)} min` : formatRest(slot.restSec)}
        </p>
        {lastLine && <p className="tnum mt-0.5 text-[0.8125rem] text-fg-faint">Last: {lastLine}</p>}
      </button>

      {/* warm-up disclosure */}
      {wuCount > 0 && (
        <div className="mt-3 rounded-[1rem] border border-dashed border-line-strong">
          <button
            className="flex h-12 w-full items-center gap-2 px-3"
            onClick={() => setWarmupOpen((o) => !o)}
          >
            <span className="shrink-0 whitespace-nowrap text-[0.9375rem] font-semibold text-fg-muted">
              Warm-up · {slot.warmupSets.min === slot.warmupSets.max ? wuCount : `${slot.warmupSets.min}–${slot.warmupSets.max}`} sets
            </span>
            {ladder.length > 0 && (
              <span className="tnum min-w-0 flex-1 truncate text-right text-[0.8125rem] text-fg-faint">
                {ladder.map((r) => `${r.weightKg}×${r.reps}`).join(" · ")}
              </span>
            )}
            <ChevronDown
              size="1rem"
              className={cn("ml-auto shrink-0 text-fg-faint transition-transform", ladder.length > 0 && "ml-0", warmupOpen && "rotate-180")}
            />
          </button>
          {warmupOpen && (
            <div className="flex flex-col gap-1.5 px-3 pb-3">
              {ladder.length === 0 ? (
                <p className="text-[0.8125rem] leading-[1.125rem] text-fg-faint">
                  Pick your working weight first — then rungs appear here. Rule of thumb: light →
                  heavier, {wuCount} sets, never near failure.
                </p>
              ) : (
                ladder.map((rung, i) => {
                  const logged = warmups.find((w) => w.setIndex === i);
                  return (
                    <div key={i} className="flex h-11 items-center gap-3">
                      <span className="overline-label w-7 text-fg-faint">W{i + 1}</span>
                      <span className="tnum flex-1 text-[0.9375rem] text-fg-muted">
                        {logged ? `${fmtW(logged.weightKg)} × ${logged.reps}` : `${rung.weightKg} kg × ${rung.reps}`}
                      </span>
                      {logged ? (
                        <CheckDraw className="text-fg-muted" />
                      ) : (
                        <button
                          onClick={() => onLogWarmup(i, rung.weightKg, rung.reps)}
                          className="flex h-9 w-14 items-center justify-center rounded-[0.5rem] bg-bg-2 text-[0.8125rem] font-medium text-fg-muted"
                        >
                          done
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* working sets */}
      <div className="mt-3 flex flex-col gap-2">
        {Array.from({ length: Math.max(slot.workingSets, working.length) }, (_, i) => {
          const logged = working.find((w) => w.setIndex === i);

          if (logged && editingId === logged.id) {
            return (
              <ActiveSetCard
                key={logged.id}
                slot={slot}
                performAs={resolved.performAs}
                setIndex={i}
                isLastSet={i >= slot.workingSets - 1}
                profile={profile}
                initial={{
                  weightKg: logged.weightKg,
                  reps: logged.reps,
                  rpe: (logged.rpe ?? slot.rpe.last) as RpeValue,
                }}
                mode="edit"
                onSave={(d) => onSaveEdit(logged.id, d)}
                onDelete={() => onDeleteSet(logged.id)}
              />
            );
          }

          if (logged) {
            const pr = prSetIds.has(logged.id);
            return (
              <motion.button
                key={logged.id}
                layout
                transition={springGentle}
                initial={{ backgroundColor: "var(--color-accent-dim)" }}
                animate={{ backgroundColor: "rgba(0,0,0,0)" }}
                onClick={() => onEditStart(logged.id)}
                className="flex h-14 w-full items-center gap-3 rounded-[1rem] border border-line px-3 text-left"
              >
                <span className="tnum w-5 text-[0.8125rem] text-fg-faint">{i + 1}</span>
                <span className="tnum flex-1 text-[1.0625rem]">
                  {fmtW(logged.weightKg)} × {logged.reps}
                </span>
                {pr && (
                  <motion.span
                    initial={{ x: 12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.32, ease: easeOutExpo, delay: 0.25 }}
                    className="flex items-center gap-1 rounded-[0.5rem] bg-gold px-1.5 py-0.5 text-[0.6875rem] font-bold text-gold-ink"
                  >
                    <Trophy size="0.625rem" /> PR
                  </motion.span>
                )}
                {logged.rpe != null && (
                  <span
                    className="tnum rounded-[0.5rem] px-1.5 py-0.5 text-[0.8125rem] font-semibold"
                    style={{
                      color: `var(--color-rpe-${String(logged.rpe).replace(".", "")})`,
                      background: `color-mix(in oklab, var(--color-rpe-${String(logged.rpe).replace(".", "")}) 12%, transparent)`,
                    }}
                  >
                    {logged.rpe}
                  </span>
                )}
                <span className="text-accent">
                  <CheckDraw />
                </span>
              </motion.button>
            );
          }

          if (i === nextIndex && editingId == null) {
            const prefill = prefillFor(i, lastSets, slot.reps.min);
            return (
              <ActiveSetCard
                key={`active-${i}-${resolved.performAs}`}
                slot={slot}
                performAs={resolved.performAs}
                setIndex={i}
                isLastSet={i >= slot.workingSets - 1}
                profile={profile}
                initial={{
                  weightKg: prefill.weightKg,
                  reps: prefill.reps,
                  rpe: ((i >= slot.workingSets - 1 ? slot.rpe.last : slot.rpe.earlyMax)) as RpeValue,
                }}
                mode="log"
                onLog={(d) => onLog(d, i)}
                onWeightChange={setLiveWeight}
              />
            );
          }

          const preview = prefillFor(i, lastSets, slot.reps.min);
          return (
            <div key={`queued-${i}`} className="flex h-14 items-center gap-3 rounded-[1rem] border border-line px-3 opacity-45">
              <span className="tnum w-5 text-[0.8125rem] text-fg-faint">{i + 1}</span>
              <span className="tnum flex-1 text-[1.0625rem] text-fg-faint">
                {preview.weightKg != null ? `${fmtW(preview.weightKg)} × ${preview.reps}` : `— × ${preview.reps}`}
              </span>
              <span className="h-5 w-5 rounded-full border border-line-strong" />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

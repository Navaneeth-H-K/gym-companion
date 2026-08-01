"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { EXERCISES, type ExerciseId } from "@/lib/exercises";
import { haptic } from "@/lib/haptics";
import { nextDown, nextUp, type IncrementProfile } from "@/lib/increments";
import { springGentle } from "@/lib/motion";
import type { ProgramSlot } from "@/lib/program";
import type { RpeValue } from "@/lib/rpe";
import { cn } from "@/lib/utils";
import { RpeQuick } from "./rpe-quick";
import { Stepper } from "./stepper";

export type SetDraft = { weightKg: number | null; reps: number; rpe: RpeValue };

function fmtWeight(w: number | null): string {
  if (w == null) return "—";
  if (w === 0) return "BW";
  const abs = Math.abs(w);
  const s = abs % 1 === 0 ? String(abs) : abs.toFixed(1);
  return w < 0 ? `−${s}` : s;
}

/**
 * The set editor — big steppers, 1-tap-default RPE, one Log button.
 * Also serves as the edit form when a logged row is tapped.
 */
export function ActiveSetCard({
  slot,
  performAs,
  setIndex,
  isLastSet,
  profile,
  initial,
  mode,
  onLog,
  onSave,
  onDelete,
  onWeightChange,
}: {
  slot: ProgramSlot;
  performAs: ExerciseId;
  setIndex: number;
  isLastSet: boolean;
  profile: IncrementProfile;
  initial: SetDraft;
  mode: "log" | "edit";
  onLog?: (d: SetDraft) => void;
  onSave?: (d: SetDraft) => void;
  onDelete?: () => void;
  onWeightChange?: (w: number | null) => void;
}) {
  const info = EXERCISES[performAs];
  const [weightKg, setWeightKg] = useState<number | null>(initial.weightKg);
  const [reps, setReps] = useState<number>(initial.reps);
  const [rpe, setRpe] = useState<RpeValue>(initial.rpe);

  const hideWeight = info.loadType === "bodyweight";
  const firstEver = !hideWeight && initial.weightKg == null && mode === "log";
  const canCommit = hideWeight || weightKg != null;

  const setWeight = (w: number | null) => {
    setWeightKg(w);
    onWeightChange?.(w);
  };

  const stepUp = () => {
    const base = weightKg ?? (profile.kind === "step" ? profile.minKg - profile.stepKg : 0);
    const next = nextUp(base, profile);
    if (next != null) setWeight(next);
  };
  const stepDown = () => {
    if (weightKg == null) {
      stepUp();
      return;
    }
    const next = nextDown(weightKg, profile);
    if (next != null) setWeight(next);
    else if (info.loadType === "bodyweight-plus") setWeight(0);
  };

  const parseWeight = (raw: string): boolean => {
    const v = Number.parseFloat(raw);
    if (!Number.isFinite(v)) return false;
    const min = info.loadType === "assisted" ? -100 : 0;
    if (v < min || v > 500) return false;
    setWeight(Math.round(v * 10) / 10);
    return true;
  };
  const parseReps = (raw: string): boolean => {
    const v = Number.parseInt(raw, 10);
    if (!Number.isFinite(v) || v < 1 || v > 99) return false;
    setReps(v);
    return true;
  };

  const draft: SetDraft = { weightKg: hideWeight ? null : weightKg, reps, rpe };
  const commitLabel = hideWeight
    ? `BW × ${reps}`
    : weightKg == null
      ? "pick a weight"
      : `${fmtWeight(weightKg)} ${info.unitLabel === "plate" ? "on the stack" : "kg"} × ${reps}`;

  return (
    <motion.div
      layout
      transition={springGentle}
      className="rounded-[20px] border border-accent/25 bg-bg-2 p-4"
    >
      <div className="flex items-baseline justify-between">
        <span className="overline-label text-fg-muted">
          {mode === "edit" ? `edit set ${setIndex + 1}` : `set ${setIndex + 1} of ${slot.workingSets}`}
          {isLastSet && mode === "log" ? " · last" : ""}
        </span>
        <span className="tnum text-[13px] text-fg-faint">
          target {slot.reps.min}–{slot.reps.max} reps
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {!hideWeight && (
          <Stepper
            label={info.loadType === "assisted" ? "assist / kg" : info.unitLabel === "plate" ? "stack #" : "weight kg"}
            value={weightKg == null ? "" : String(weightKg)}
            display={fmtWeight(weightKg)}
            onDecrement={stepDown}
            onIncrement={stepUp}
            onDirectEntry={parseWeight}
            inputMode="decimal"
          />
        )}
        {firstEver && (
          <p className="text-[13px] leading-[18px] text-fg-faint">
            First time — start light, around RPE 6–7. Tap the number to type a weight.
          </p>
        )}
        <Stepper
          label="reps"
          value={String(reps)}
          onDecrement={() => setReps((r) => Math.max(1, r - 1))}
          onIncrement={() => setReps((r) => Math.min(99, r + 1))}
          onDirectEntry={parseReps}
          inputMode="numeric"
        />
        <RpeQuick
          target={(isLastSet ? slot.rpe.last : slot.rpe.earlyMax) as RpeValue}
          isLastSet={isLastSet}
          value={rpe}
          onChange={setRpe}
        />
      </div>

      {mode === "log" ? (
        <motion.button
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.09 }}
          disabled={!canCommit}
          onClick={() => onLog?.(draft)}
          className={cn(
            "tnum mt-4 h-[60px] w-full rounded-[16px] bg-accent text-[16px] font-semibold text-accent-ink",
            !canCommit && "opacity-40",
          )}
        >
          Log set — {commitLabel}
        </motion.button>
      ) : (
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => {
              haptic("destructive");
              onDelete?.();
            }}
            aria-label="Delete set"
            className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-danger/40 text-danger"
          >
            <Trash2 size={18} />
          </button>
          <button
            disabled={!canCommit}
            onClick={() => onSave?.(draft)}
            className={cn(
              "tnum h-14 flex-1 rounded-[16px] bg-accent text-[15px] font-semibold text-accent-ink",
              !canCommit && "opacity-40",
            )}
          >
            Save — {commitLabel}
          </button>
        </div>
      )}
    </motion.div>
  );
}

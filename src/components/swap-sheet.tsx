"use client";

import { haptic } from "@/lib/haptics";
import { EXERCISES, MUSCLE_LABELS, type ExerciseId } from "@/lib/exercises";
import type { ProgramSlot } from "@/lib/program";
import { resolveExercise, type ResolvedExercise } from "@/lib/stations";
import { FloorChip } from "./floor-chip";
import { Sheet } from "./sheet";
import { StationPhoto } from "./station-photo";

function overlapLabel(a: ExerciseId, b: ExerciseId): string {
  const pa = new Set(EXERCISES[a].primaryMuscles);
  const shared = EXERCISES[b].primaryMuscles.filter((m) => pa.has(m));
  const list = (shared.length ? shared : EXERCISES[b].primaryMuscles).slice(0, 2);
  return `same: ${list.map((m) => MUSCLE_LABELS[m].toLowerCase()).join(", ")}`;
}

/**
 * "Station busy" flow. Un-logged slot: one tap swaps for today only.
 * Slot already has working sets: swapping mid-lift would corrupt the
 * history, so the offer becomes "swap for next time" (a permanent
 * override).
 */
export function SwapSheet({
  open,
  onClose,
  slot,
  resolved,
  locked,
  onSwap,
  onOverride,
}: {
  open: boolean;
  onClose: () => void;
  slot: ProgramSlot;
  resolved: ResolvedExercise;
  locked: boolean;
  onSwap: (performAs: ExerciseId) => void;
  onOverride: (performAs: ExerciseId) => void;
}) {
  const currentInfo = EXERCISES[resolved.performAs];
  const options = slot.substitutions.filter((s) => s !== resolved.performAs);

  return (
    <Sheet open={open} onClose={onClose} title="Station busy — swap this exercise">
      <div className="flex flex-col gap-2">
        {/* current, dimmed */}
        <div className="flex items-center gap-3 rounded-[16px] bg-bg-2 p-3 opacity-50">
          <StationPhoto station={resolved.station} size={40} />
          <div className="flex-1">
            <div className="text-[15px] font-semibold">{currentInfo.name}</div>
            <div className="overline-label mt-0.5 text-fg-faint">current</div>
          </div>
          <FloorChip station={resolved.station} />
        </div>

        {options.map((subId) => {
          const subResolved = resolveExercise(subId);
          const info = EXERCISES[subId];
          return (
            <button
              key={subId}
              onClick={() => {
                haptic("select");
                if (locked) onOverride(subId);
                else onSwap(subId);
              }}
              className="flex items-center gap-3 rounded-[20px] bg-bg-2 p-3 text-left"
            >
              <StationPhoto station={subResolved.station} size={64} />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold">{info.name}</div>
                <div className="mt-0.5 flex items-center gap-2">
                  <FloorChip station={subResolved.station} />
                  <span className="truncate text-[13px] text-fg-muted">
                    {subResolved.station?.name ?? "location unknown"}
                  </span>
                </div>
                <div className="mt-0.5 text-[13px] text-fg-faint">
                  {overlapLabel(resolved.performAs, subId)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[13px] leading-[18px] text-fg-faint">
        {locked
          ? "This slot already has logged sets, so today stays as-is — tapping a substitute makes it your version from the next session on."
          : "Swap applies to today only. Each exercise keeps its own history and progression."}
      </p>
    </Sheet>
  );
}

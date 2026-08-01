"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { EXERCISES, type ExerciseId } from "@/lib/exercises";
import { haptic } from "@/lib/haptics";
import type { ProgramSlot } from "@/lib/program";
import { setOverride } from "@/lib/repo";
import { HOUSE_DEFAULTS, resolveExercise } from "@/lib/stations";
import { cn } from "@/lib/utils";
import { FloorChip } from "./floor-chip";
import { Sheet } from "./sheet";
import { StationPhoto } from "./station-photo";

function Option({
  id,
  note,
  selected,
  onPick,
}: {
  id: ExerciseId;
  note?: string;
  selected: boolean;
  onPick: (id: ExerciseId) => void;
}) {
  const r = resolveExercise(id);
  return (
    <button
      onClick={() => onPick(id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-[1rem] border bg-bg-2 p-3 text-left",
        selected ? "border-accent" : "border-transparent",
      )}
    >
      <StationPhoto station={r.station} size={48} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] font-semibold">{EXERCISES[id].name}</span>
        <span className="mt-0.5 flex items-center gap-1.5">
          <FloorChip station={r.station} />
          <span className="truncate text-[0.8125rem] text-fg-muted">
            {note ?? r.station?.name ?? "location unknown"}
          </span>
        </span>
      </span>
      {selected && <Check size="1.125rem" className="shrink-0 text-accent" />}
    </button>
  );
}

/**
 * "Set your house version" — how this program exercise is performed at
 * this gym, every week, until changed. Un-logged sets today update too
 * (resolution is computed live).
 */
export function OverrideSheet({
  open,
  onClose,
  slot,
  currentPerformAs,
}: {
  open: boolean;
  onClose: () => void;
  slot: ProgramSlot;
  currentPerformAs: ExerciseId;
}) {
  const programId = slot.exerciseId;
  const houseDefault = HOUSE_DEFAULTS[programId]?.performAs ?? programId;
  const standard: ExerciseId[] = [programId, ...slot.substitutions];
  const [picked, setPicked] = useState<ExerciseId>(currentPerformAs);
  const [customOpen, setCustomOpen] = useState(!standard.includes(currentPerformAs));

  const save = async () => {
    haptic("select");
    if (picked === houseDefault) await setOverride(programId, { performAs: null });
    else await setOverride(programId, { performAs: picked });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={`${EXERCISES[programId].name} — your version`}>
      <div className="flex flex-col gap-2">
        <Option
          id={programId}
          note={programId === houseDefault ? undefined : "as written"}
          selected={picked === programId}
          onPick={setPicked}
        />
        {slot.substitutions.map((s) => (
          <Option key={s} id={s} selected={picked === s} onPick={setPicked} />
        ))}

        {customOpen ? (
          <select
            value={standard.includes(picked) ? "" : picked}
            onChange={(e) => e.target.value && setPicked(e.target.value as ExerciseId)}
            className="h-12 w-full rounded-[0.75rem] border border-line-strong bg-bg-2 px-3 text-[0.9375rem] outline-none"
          >
            <option value="" disabled>
              Pick any exercise…
            </option>
            {Object.entries(EXERCISES)
              .sort(([, a], [, b]) => a.name.localeCompare(b.name))
              .map(([id, info]) => (
                <option key={id} value={id}>
                  {info.name}
                </option>
              ))}
          </select>
        ) : (
          <button
            onClick={() => setCustomOpen(true)}
            className="h-12 rounded-[1rem] border border-dashed border-line-strong text-[0.8125rem] font-medium text-fg-muted"
          >
            Something else…
          </button>
        )}
      </div>

      <button
        onClick={() => void save()}
        className="mt-4 h-14 w-full rounded-[1rem] bg-accent text-[0.9375rem] font-semibold text-accent-ink"
      >
        Save as my version
      </button>
      <p className="mt-2 text-center text-[0.8125rem] text-fg-faint">
        Applies every week until changed. Progression history stays per exercise.
      </p>
    </Sheet>
  );
}

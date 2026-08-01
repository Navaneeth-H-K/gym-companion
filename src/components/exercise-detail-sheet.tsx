"use client";

import { useState } from "react";
import Image from "next/image";
import { useLiveQuery } from "dexie-react-hooks";
import { Dumbbell, MapPin, Pencil } from "lucide-react";
import { EXERCISES, MUSCLE_LABELS, type ExerciseId } from "@/lib/exercises";
import { humanDate } from "@/lib/ist";
import { formatRest, formatRpe, formatSetsReps, type ProgramSlot } from "@/lib/program";
import { saveExerciseMeta } from "@/lib/repo";
import { recentExerciseSessions, settings } from "@/lib/selectors";
import type { Station } from "@/lib/stations";
import { cn } from "@/lib/utils";
import { FloorChip } from "./floor-chip";
import { Sheet } from "./sheet";

/** The exercise dossier: photo, wayfinding, muscles, cues (editable),
 *  setup note (editable — machine seat/pin gold), recent history. */
export function ExerciseDetailSheet({
  open,
  onClose,
  performAs,
  station,
  slot,
  houseNote,
}: {
  open: boolean;
  onClose: () => void;
  performAs: ExerciseId;
  station: Station | null;
  slot?: ProgramSlot;
  houseNote?: string;
}) {
  const info = EXERCISES[performAs];
  const s = useLiveQuery(settings, []);
  const history = useLiveQuery(
    async () => (open ? await recentExerciseSessions(performAs) : []),
    [open, performAs],
  );
  const [editingSetup, setEditingSetup] = useState(false);

  const cues = s?.cueOverrides[performAs] ?? info.cues ?? [];
  const setup = s?.setupNotes[performAs] ?? info.setup ?? "";

  return (
    <Sheet open={open} onClose={onClose} tall>
      {/* photo */}
      {station?.photo ? (
        <div className="relative h-44 w-full overflow-hidden rounded-[1.25rem]">
          <Image src={station.photo} alt={station.name} fill unoptimized className="object-cover" />
          <div className="absolute bottom-0 left-0 flex items-center gap-2 rounded-tr-[0.75rem] bg-black/65 px-3 py-1.5">
            <FloorChip station={station} />
            <span className="text-[0.8125rem] font-medium">{station.name}</span>
          </div>
        </div>
      ) : (
        <div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-line bg-bg-2">
          <Dumbbell size="1.5rem" className="text-fg-faint" />
          <span className="overline-label text-fg-faint">photo pending</span>
        </div>
      )}

      <h2 className="mt-4 font-display text-[1.5rem] font-semibold leading-[1.75rem]">{info.name}</h2>

      {slot && (
        <p className="tnum mt-1 text-[0.8125rem] text-fg-muted">
          {formatSetsReps(slot)} @ RPE {formatRpe(slot.rpe)} · rest {formatRest(slot.restSec)}
        </p>
      )}

      {/* wayfinding */}
      {station && (
        <div className="mt-3 flex items-start gap-2 rounded-[1rem] bg-bg-2 p-3">
          <MapPin size="1rem" className="mt-0.5 shrink-0 text-accent-2" />
          <p className="text-[0.8125rem] leading-[1.125rem] text-fg-muted">
            <span className="font-medium text-fg">
              F{station.floor} · {station.area}.
            </span>{" "}
            {station.howToFind}
          </p>
        </div>
      )}

      {houseNote && (
        <p className="mt-2 border-l-2 border-accent pl-3 text-[0.8125rem] leading-[1.125rem] text-fg-muted">
          {houseNote}
        </p>
      )}

      {/* muscles */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {info.primaryMuscles.map((m) => (
          <span key={m} className="rounded-[0.5rem] bg-accent-dim px-2 py-1 text-[0.8125rem] font-medium text-accent">
            {MUSCLE_LABELS[m]}
          </span>
        ))}
        {info.secondaryMuscles.map((m) => (
          <span key={m} className="rounded-[0.5rem] bg-bg-2 px-2 py-1 text-[0.8125rem] text-fg-muted">
            {MUSCLE_LABELS[m]}
          </span>
        ))}
      </div>

      {/* cues */}
      {cues.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {cues.map((cue) => (
            <li key={cue} className="relative pl-4 text-[0.9375rem] leading-[1.375rem] text-fg-muted">
              <span className="absolute left-0 top-[0.5625rem] h-[0.3125rem] w-[0.3125rem] rounded-full bg-accent" />
              {cue}
            </li>
          ))}
        </ul>
      )}

      {/* setup note */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="overline-label text-fg-faint">your setup</span>
          <button
            aria-label="Edit setup note"
            className="flex h-10 w-10 items-center justify-center text-fg-faint"
            onClick={() => setEditingSetup(true)}
          >
            <Pencil size="0.875rem" />
          </button>
        </div>
        {editingSetup ? (
          <input
            autoFocus
            defaultValue={setup}
            placeholder="seat 4 · pin 8 · rope attachment"
            onBlur={(e) => {
              setEditingSetup(false);
              void saveExerciseMeta(performAs, { setup: e.target.value.trim() });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="tnum w-full rounded-[0.75rem] border border-line-strong bg-bg-2 px-3 py-2.5 text-[0.8125rem] outline-none"
          />
        ) : (
          <button
            onClick={() => setEditingSetup(true)}
            className={cn(
              "tnum w-full rounded-[0.75rem] bg-bg-2 px-3 py-2.5 text-left text-[0.8125rem]",
              setup ? "text-fg" : "text-fg-faint",
            )}
          >
            {setup || "seat height, pin, attachment — tap to note it"}
          </button>
        )}
      </div>

      {/* history */}
      {history && history.length > 0 && (
        <div className="mt-4">
          <span className="overline-label text-fg-faint">recent</span>
          <div className="mt-2 flex flex-col gap-1.5">
            {history.map((h) => (
              <div key={h.sessionId} className="flex items-baseline justify-between text-[0.8125rem]">
                <span className="text-fg-faint">{h.dateKey ? humanDate(h.dateKey) : "—"}</span>
                <span className="tnum text-fg-muted">
                  {h.sets
                    .map((st) => `${st.weightKg == null ? "BW" : st.weightKg}×${st.reps}`)
                    .join(", ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  );
}

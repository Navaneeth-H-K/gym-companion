"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "motion/react";
import { ArrowLeftRight, Camera, ChevronLeft, Pencil, Wind } from "lucide-react";
import { FloorChip } from "@/components/floor-chip";
import { OverrideSheet } from "@/components/override-sheet";
import { PrescriptionStrip } from "@/components/prescription-strip";
import { StationPhoto } from "@/components/station-photo";
import { EXERCISES } from "@/lib/exercises";
import { haptic } from "@/lib/haptics";
import { fadeUp, stagger } from "@/lib/motion";
import { GENERAL_WARMUP, PROGRAM, workingSetCount, type DayKey } from "@/lib/program";
import { resumeOrStart } from "@/lib/repo";
import { allOverrides } from "@/lib/selectors";
import { resolveExercise } from "@/lib/stations";

const VALID = new Set(Object.keys(PROGRAM));

export default function PlanDayPage() {
  const { dayKey: raw } = useParams<{ dayKey: string }>();
  const router = useRouter();
  const overridesRows = useLiveQuery(allOverrides, []);
  const overrides = useMemo(() => overridesRows ?? [], [overridesRows]);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  if (!raw || !VALID.has(raw)) {
    router.replace("/plan");
    return null;
  }
  const dayKey = raw as DayKey;
  const day = PROGRAM[dayKey];

  const start = async () => {
    haptic("select");
    const session = await resumeOrStart(dayKey);
    router.push(`/workout/${session.id}`);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="pt-2 safe-top">
      {/* sticky mini header */}
      <div className="sticky top-0 z-20 flex h-14 items-center gap-2 bg-bg px-3">
        <button
          aria-label="Back to plan"
          onClick={() => router.push("/plan")}
          className="flex h-11 w-11 items-center justify-center text-fg-muted"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[17px] font-semibold">{day.title}</div>
          <div className="overline-label text-fg-faint">{day.focusLabel}</div>
        </div>
        <button
          onClick={() => void start()}
          className="h-11 rounded-[12px] bg-accent px-4 text-[15px] font-semibold text-accent-ink"
        >
          Start
        </button>
      </div>

      <div className="flex flex-col gap-3 px-5 pt-2">
        {/* general warm-up banner */}
        <motion.div variants={fadeUp} className="flex items-start gap-2 rounded-[16px] bg-accent-2-dim p-3">
          <Wind size={16} className="mt-0.5 shrink-0 text-accent-2" />
          <p className="text-[13px] leading-[18px] text-fg-muted">{GENERAL_WARMUP}</p>
        </motion.div>

        {day.slots.map((slot) => {
          const override = overrides.find((o) => o.exerciseId === slot.exerciseId);
          const resolved = resolveExercise(slot.exerciseId, override);
          const programInfo = EXERCISES[slot.exerciseId];
          const performedInfo = EXERCISES[resolved.performAs];
          const differs = resolved.performAs !== slot.exerciseId;

          return (
            <motion.div key={slot.slot} variants={fadeUp} className="rounded-[24px] bg-bg-1 p-4">
              {/* header */}
              <div className="flex items-center gap-3">
                <span className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-bg-2 text-[13px] text-fg-muted">
                  {slot.slot + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[17px] font-semibold">{programInfo.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <FloorChip station={resolved.station} />
                    <span className="truncate text-[13px] text-fg-muted">
                      {resolved.station?.name ?? "location unknown"}
                    </span>
                  </div>
                </div>
                <StationPhoto station={resolved.station} size={56} className="rounded-[12px]" />
              </div>

              <div className="mt-3">
                <PrescriptionStrip slot={slot} />
              </div>

              {/* substitutions */}
              <div className="mt-3 flex flex-col gap-1">
                {slot.substitutions.map((subId) => {
                  const subResolved = resolveExercise(subId);
                  return (
                    <div key={subId} className="flex h-10 items-center gap-2">
                      <ArrowLeftRight size={13} className="shrink-0 text-fg-faint" />
                      <span className="min-w-0 flex-1 truncate text-[15px] text-fg-muted">
                        {EXERCISES[subId].name}
                      </span>
                      <FloorChip station={subResolved.station} />
                      <span className="max-w-[120px] truncate text-[13px] text-fg-faint">
                        {subResolved.station?.name ?? "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* house-version row */}
              {differs && (
                <div className="mt-2 flex items-center gap-2 border-l-2 border-accent py-1 pl-3">
                  <span className="min-w-0 flex-1 text-[13px] leading-[18px] text-fg-muted">
                    At your gym: <span className="font-semibold text-fg">{performedInfo.name}</span>
                    {resolved.station ? ` — F${resolved.station.floor}, ${resolved.station.area}` : ""}
                  </span>
                  <button
                    onClick={() => setEditingSlot(slot.slot)}
                    className="flex h-11 shrink-0 items-center gap-1 px-2 text-[13px] font-medium text-fg-muted"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                </div>
              )}
              {!differs && (
                <button
                  onClick={() => setEditingSlot(slot.slot)}
                  className="mt-1 flex h-11 items-center gap-1 text-[13px] font-medium text-fg-faint"
                >
                  <Pencil size={12} /> Change how you do this
                </button>
              )}

              {!resolved.station?.photo && (
                <div className="mt-1 flex items-center gap-1.5 text-fg-faint">
                  <Camera size={12} />
                  <span className="overline-label text-[10px]">photo pending</span>
                </div>
              )}
            </motion.div>
          );
        })}

        <motion.p variants={fadeUp} className="tnum pb-4 text-center text-[13px] text-fg-faint">
          ≈ {workingSetCount(day)} working sets · est {day.estMinutes.min}–{day.estMinutes.max} min
        </motion.p>
      </div>

      {editingSlot != null && (
        <OverrideSheet
          open
          onClose={() => setEditingSlot(null)}
          slot={day.slots[editingSlot]}
          currentPerformAs={
            resolveExercise(
              day.slots[editingSlot].exerciseId,
              overrides.find((o) => o.exerciseId === day.slots[editingSlot].exerciseId),
            ).performAs
          }
        />
      )}
    </motion.div>
  );
}

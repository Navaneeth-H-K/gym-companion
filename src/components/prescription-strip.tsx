import { formatRpe, formatSetsReps, type ProgramSlot } from "@/lib/program";

/** The 4-cell strip that replaces a spreadsheet row on a 375px screen. */
export function PrescriptionStrip({ slot }: { slot: ProgramSlot }) {
  const rest = `${slot.restSec.min / 60}–${slot.restSec.max / 60}m`;
  const warmup =
    slot.warmupSets.min === slot.warmupSets.max
      ? `${slot.warmupSets.max}`
      : `${slot.warmupSets.min}–${slot.warmupSets.max}`;
  const lastToken = `var(--color-rpe-${String(slot.rpe.last).replace(".", "")})`;

  const cells: { label: string; value: React.ReactNode }[] = [
    { label: "warm-up", value: `${warmup} sets` },
    { label: "working", value: formatSetsReps(slot) },
    {
      label: "rpe",
      value: <span style={{ color: lastToken }}>{formatRpe(slot.rpe)}</span>,
    },
    { label: "rest", value: rest },
  ];

  return (
    <div className="grid grid-cols-4 divide-x divide-line rounded-[12px] border border-line">
      {cells.map((c) => (
        <div key={c.label} className="flex flex-col items-center gap-0.5 px-1 py-2.5">
          <span className="overline-label text-[10px] text-fg-faint">{c.label}</span>
          <span className="tnum text-center text-[15px] font-medium leading-5">{c.value}</span>
        </div>
      ))}
    </div>
  );
}

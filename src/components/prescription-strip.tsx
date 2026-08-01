import type { ProgramSlot } from "@/lib/program";

/**
 * The 4-cell strip that replaces a spreadsheet row on a 375px screen.
 * Values are deliberately terse — the labels carry the nouns, so nothing
 * has to wrap in a ~78px column.
 */
export function PrescriptionStrip({ slot }: { slot: ProgramSlot }) {
  const dash = (a: number, b: number) => (a === b ? `${a}` : `${a}–${b}`);
  const lastToken = `var(--color-rpe-${String(slot.rpe.last).replace(".", "")})`;

  const cells: { label: string; value: React.ReactNode }[] = [
    { label: "warm-up", value: dash(slot.warmupSets.min, slot.warmupSets.max) },
    { label: "working", value: `${slot.workingSets}×${dash(slot.reps.min, slot.reps.max)}` },
    {
      label: "rpe",
      value: (
        <>
          {dash(slot.rpe.earlyMin, slot.rpe.earlyMax)}
          <span className="text-fg-faint">→</span>
          <span style={{ color: lastToken }}>{slot.rpe.last}</span>
        </>
      ),
    },
    { label: "rest", value: `${dash(slot.restSec.min / 60, slot.restSec.max / 60)}m` },
  ];

  return (
    <div className="grid grid-cols-4 divide-x divide-line rounded-[12px] border border-line">
      {cells.map((c) => (
        <div key={c.label} className="flex flex-col items-center gap-1 px-1 py-2.5">
          <span className="overline-label text-[10px] text-fg-faint">{c.label}</span>
          <span className="tnum whitespace-nowrap text-[14px] font-medium leading-[18px]">
            {c.value}
          </span>
        </div>
      ))}
    </div>
  );
}

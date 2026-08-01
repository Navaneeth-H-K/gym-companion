import type { Station } from "@/lib/stations";
import { cn } from "@/lib/utils";

/** "F1" / "F2" location chip — color is redundant with the label. */
export function FloorChip({ station, className }: { station: Station | null; className?: string }) {
  if (!station) {
    return (
      <span
        className={cn(
          "overline-label inline-flex h-[22px] items-center rounded-[8px] bg-bg-2 px-2 text-fg-faint",
          className,
        )}
      >
        ? floor
      </span>
    );
  }
  return (
    <span
      className={cn(
        "overline-label inline-flex h-[22px] items-center rounded-[8px] px-2",
        station.floor === 1 ? "bg-accent-2-dim text-accent-2" : "bg-accent-dim text-accent",
        className,
      )}
    >
      F{station.floor}
    </span>
  );
}

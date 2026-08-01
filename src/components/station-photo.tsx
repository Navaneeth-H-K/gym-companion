import Image from "next/image";
import { Dumbbell } from "lucide-react";
import type { Station } from "@/lib/stations";
import { cn } from "@/lib/utils";

/**
 * Station photo with the "photo pending" placeholder tile.
 * `size` is in design pixels against the 375px reference and is rendered
 * as rem, so the tile scales with the phone like everything else.
 */
export function StationPhoto({
  station,
  size = 72,
  className,
}: {
  station: Station | null;
  size?: number;
  className?: string;
}) {
  const box = `${size / 16}rem`;
  const glyph = `${Math.max(18, Math.round(size / 3.2)) / 16}rem`;

  if (station?.photo) {
    return (
      <Image
        src={station.photo}
        alt={station.name}
        width={size * 2}
        height={size * 2}
        unoptimized
        className={cn("shrink-0 rounded-[1rem] border border-line object-cover", className)}
        style={{ width: box, height: box }}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[1rem] border border-line bg-bg-2",
        className,
      )}
      style={{ width: box, height: box }}
    >
      <Dumbbell size={glyph} className="text-fg-faint" />
    </div>
  );
}

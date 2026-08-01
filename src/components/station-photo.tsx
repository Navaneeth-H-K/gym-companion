import Image from "next/image";
import { Dumbbell } from "lucide-react";
import type { Station } from "@/lib/stations";
import { cn } from "@/lib/utils";

/** Station photo with the "photo pending" placeholder tile. */
export function StationPhoto({
  station,
  size = 72,
  className,
}: {
  station: Station | null;
  size?: number;
  className?: string;
}) {
  if (station?.photo) {
    return (
      <Image
        src={station.photo}
        alt={station.name}
        width={size}
        height={size}
        unoptimized
        className={cn("shrink-0 rounded-[16px] border border-line object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[16px] border border-line bg-bg-2",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Dumbbell size={Math.max(18, Math.round(size / 3.2))} className="text-fg-faint" />
    </div>
  );
}

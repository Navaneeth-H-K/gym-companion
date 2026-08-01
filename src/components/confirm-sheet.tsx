"use client";

import { useEffect, useState } from "react";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { Sheet } from "./sheet";

/** Danger button that arms itself 300ms after mount — absorbs fat-finger
 *  double taps. Mounted fresh on every sheet open, so no reset needed. */
function ArmedDangerButton({ label, onPress }: { label: string; onPress: () => void }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setArmed(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <button
      disabled={!armed}
      onClick={() => {
        haptic("destructive");
        onPress();
      }}
      className={cn(
        "h-14 rounded-[16px] bg-danger text-[15px] font-semibold text-bg transition-opacity",
        !armed && "opacity-40",
      )}
    >
      {label}
    </button>
  );
}

/** Destructive confirmation sheet. */
export function ConfirmSheet({
  open,
  onClose,
  title,
  body,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body?: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {body && <p className="mb-4 text-[15px] leading-[22px] text-fg-muted">{body}</p>}
      <div className="flex flex-col gap-3">
        <ArmedDangerButton label={confirmLabel} onPress={onConfirm} />
        <button onClick={onClose} className="h-14 rounded-[16px] bg-bg-2 text-[15px] font-semibold">
          Cancel
        </button>
      </div>
    </Sheet>
  );
}

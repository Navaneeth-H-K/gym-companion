"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { springSheet } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type ToastData = {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Single pill toast; swipe away or 5s auto-dismiss. Anchors to the top in
 * workout mode so it never covers the Log button.
 */
export function Toast({
  toast,
  onDismiss,
  anchor = "bottom",
}: {
  toast: ToastData | null;
  onDismiss: () => void;
  anchor?: "top" | "bottom";
}) {
  const fromTop = anchor === "top";
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ y: fromTop ? -24 : 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: springSheet }}
          exit={{ y: fromTop ? -24 : 24, opacity: 0, transition: { duration: 0.14 } }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={fromTop ? { top: 0.8, bottom: 0 } : { top: 0, bottom: 0.8 }}
          onDragEnd={(_, info) => {
            const away = fromTop ? -info.offset.y : info.offset.y;
            const fling = fromTop ? -info.velocity.y : info.velocity.y;
            if (away > 24 || fling > 500) onDismiss();
          }}
          className={cn(
            "fixed inset-x-5 z-40 mx-auto flex h-12 max-w-md items-center justify-between rounded-full bg-bg-3 px-5 shadow-[0_0_0_1px_var(--color-line)]",
            fromTop ? "top-[4.5rem]" : "bottom-28",
          )}
        >
          <span className="truncate text-[0.8125rem] font-medium">{toast.message}</span>
          {toast.actionLabel && (
            <button
              onClick={() => {
                toast.onAction?.();
                onDismiss();
              }}
              className="ml-3 shrink-0 text-[0.8125rem] font-semibold text-accent"
            >
              {toast.actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

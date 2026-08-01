"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { backdropVariants, sheetVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Shared bottom sheet: spring entry, drag-to-dismiss (velocity > 800px/s
 *  or 45% of height), dim backdrop. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  tall = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  tall?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Close"
            className="fixed inset-0 z-40 bg-black/60"
            variants={backdropVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md rounded-t-[28px] bg-bg-3 px-5 safe-bottom",
              tall && "max-h-[85dvh] overflow-y-auto",
            )}
            variants={sheetVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              const h = ref.current?.offsetHeight ?? 400;
              if (info.velocity.y > 800 || info.offset.y > h * 0.45) onClose();
            }}
          >
            <div className="mx-auto mb-3 mt-2 h-1 w-9 rounded-full bg-line-strong" />
            {title && <h2 className="mb-4 text-[17px] font-semibold tracking-tight">{title}</h2>}
            <div className="pb-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

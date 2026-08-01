"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { CalendarRange, ChartLine, Flame, Settings2, type LucideIcon } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { springPill } from "@/lib/motion";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/today", label: "Today", icon: Flame },
  { href: "/plan", label: "Plan", icon: CalendarRange },
  { href: "/progress", label: "Progress", icon: ChartLine },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t border-line bg-bg-1 safe-bottom">
      <div className="grid h-16 grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => haptic("select")}
              className="relative flex flex-col items-center justify-center gap-1"
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  transition={springPill}
                  className="absolute top-0 h-[0.1875rem] w-7 rounded-full bg-accent"
                />
              )}
              <Icon size="1.5rem" className={active ? "text-accent" : "text-fg-faint"} />
              <span
                className={cn(
                  "text-[0.6875rem] font-medium leading-[0.875rem]",
                  active ? "text-accent" : "text-fg-faint",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

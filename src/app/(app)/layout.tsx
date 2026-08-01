"use client";

import { usePathname } from "next/navigation";
import { FeedbackProvider } from "@/components/feedback-provider";
import { TabBar } from "@/components/tab-bar";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Workout mode is fullscreen — no tabs, exit only via ✕ or Finish.
  const immersive = pathname?.startsWith("/workout");

  return (
    <FeedbackProvider>
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col">
        <main className={cn("flex-1", !immersive && "pb-28")}>{children}</main>
        {!immersive && <TabBar />}
      </div>
    </FeedbackProvider>
  );
}

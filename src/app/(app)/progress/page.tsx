"use client";

import { ChartLine } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="px-5 pt-4 safe-top">
      <h1 className="font-display text-[1.875rem] font-semibold leading-[2.125rem]">Progress</h1>
      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <ChartLine size="2.5rem" className="text-fg-faint" />
        <p className="max-w-[15rem] text-[0.9375rem] leading-[1.375rem] text-fg-muted">
          Charts unlock after your first few sessions — e1RM trends, volume by muscle, and the PR
          list land here.
        </p>
      </div>
    </div>
  );
}

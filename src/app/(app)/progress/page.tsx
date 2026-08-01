"use client";

import { ChartLine } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="px-5 pt-4 safe-top">
      <h1 className="font-display text-[30px] font-semibold leading-[34px]">Progress</h1>
      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <ChartLine size={40} className="text-fg-faint" />
        <p className="max-w-[240px] text-[15px] leading-[22px] text-fg-muted">
          Charts unlock after your first few sessions — e1RM trends, volume by muscle, and the PR
          list land here.
        </p>
      </div>
    </div>
  );
}

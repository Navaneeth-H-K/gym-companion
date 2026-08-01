import { CloudOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-8 text-center">
      <CloudOff size={40} className="text-fg-faint" />
      <h1 className="font-display text-[24px] font-semibold">Offline, and that&apos;s fine</h1>
      <p className="text-[15px] leading-[22px] text-fg-muted">
        This page wasn&apos;t cached yet. Your workout data lives on-device — head back and keep
        lifting.
      </p>
      <a
        href="/today"
        className="mt-2 flex h-12 items-center rounded-[16px] bg-accent px-6 text-[15px] font-semibold text-accent-ink"
      >
        Back to Today
      </a>
    </div>
  );
}

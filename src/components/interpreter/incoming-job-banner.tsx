"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

export function IncomingJobBanner({
  jobId,
  text,
}: {
  jobId: string;
  text: string;
}) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      onClick={() => {
        setVisible(false);
        router.push(`/interpreter/jobs/${jobId}`);
      }}
      className="animate-push-in fixed left-2.5 right-2.5 top-3.5 z-50 flex cursor-pointer items-start gap-2.5 rounded-2xl border border-black/5 bg-white/95 p-3.5 shadow-[0_8px_24px_rgba(16,24,40,.18)] backdrop-blur-md"
      style={{ maxWidth: 480, marginInline: "auto" }}
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-navy">
        <Bell size={16} strokeWidth={1.8} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[12.5px] font-bold">SV24 OS</div>
          <div className="flex-shrink-0 text-[11px] text-text-tertiary">jetzt</div>
        </div>
        <div className="mt-px text-[12.5px] font-semibold">Neuer Auftrag</div>
        <div className="mt-px truncate text-xs text-[#4B5563]">{text}</div>
      </div>
    </div>
  );
}

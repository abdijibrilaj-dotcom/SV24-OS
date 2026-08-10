"use client";

import { useEffect, useState } from "react";
import { getExistingSubscription, subscribeToPush, unsubscribeFromPush } from "@/lib/push-client";

export function PushToggle() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window);
    getExistingSubscription().then((sub) => setEnabled(!!sub));
  }, []);

  async function toggle() {
    setError(null);
    setPending(true);
    try {
      if (enabled) {
        await unsubscribeFromPush();
        setEnabled(false);
      } else {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) throw new Error("Push ist auf diesem Server nicht konfiguriert.");
        await subscribeToPush(vapidKey);
        setEnabled(true);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  if (!supported) {
    return <div className="text-xs text-text-tertiary">Push-Benachrichtigungen werden in diesem Browser nicht unterstützt.</div>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="flex w-full items-center justify-between py-2.5 disabled:opacity-50"
      >
        <span className="text-sm">Push-Benachrichtigungen</span>
        <span
          className="relative inline-block h-6 w-10 flex-shrink-0 rounded-full transition"
          style={{ background: enabled ? "#16233A" : "#E4E6EA" }}
        >
          <span
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
            style={{ left: enabled ? "18px" : "2px" }}
          />
        </span>
      </button>
      {error && <p className="pb-2 text-[12px] font-medium text-pill-red-fg">{error}</p>}
    </div>
  );
}

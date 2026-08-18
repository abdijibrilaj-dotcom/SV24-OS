"use client";

import { useEffect } from "react";
import { RouteFallback } from "@/components/ui/route-fallback";

export default function BueroError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-content-bg-mobile">
      <RouteFallback
        icon="error"
        title="Etwas ist schiefgelaufen"
        description="Diese Seite konnte nicht geladen werden. Bitte versuche es erneut."
        action={
          <div className="mt-2 flex gap-2.5">
            <button
              onClick={() => (window.location.href = "/buero")}
              className="rounded-xl border border-field-border bg-white px-4 py-2.5 text-sm font-bold text-text-secondary"
            >
              Zur Startseite
            </button>
            <button onClick={reset} className="rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white">
              Erneut versuchen
            </button>
          </div>
        }
      />
    </div>
  );
}

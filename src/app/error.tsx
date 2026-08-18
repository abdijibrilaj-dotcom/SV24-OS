"use client";

import { useEffect } from "react";
import { RouteFallback } from "@/components/ui/route-fallback";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <RouteFallback
        icon="error"
        title="Etwas ist schiefgelaufen"
        description="Diese Seite konnte nicht geladen werden. Bitte versuche es erneut."
        action={
          <button onClick={reset} className="mt-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white">
            Erneut versuchen
          </button>
        }
      />
    </div>
  );
}

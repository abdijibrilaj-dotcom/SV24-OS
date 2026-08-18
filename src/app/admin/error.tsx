"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RouteFallback } from "@/components/ui/route-fallback";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EEF1F4]">
      <RouteFallback
        icon="error"
        title="Etwas ist schiefgelaufen"
        description="Diese Seite konnte nicht geladen werden. Das kann an einer kurzzeitigen Verbindungsstörung liegen — bitte versuche es erneut."
        action={
          <div className="mt-2 flex gap-2.5">
            <Button variant="secondary" onClick={() => (window.location.href = "/admin")}>
              Zur Übersicht
            </Button>
            <Button variant="primary" onClick={reset}>
              Erneut versuchen
            </Button>
          </div>
        }
      />
    </div>
  );
}

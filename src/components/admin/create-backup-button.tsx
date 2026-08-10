"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createBackupAction } from "@/lib/actions/backup-actions";

export function CreateBackupButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run() {
    setError(null);
    startTransition(async () => {
      const result = await createBackupAction();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant="dark" onClick={run} disabled={pending}>
        {pending ? "Backup wird erstellt…" : "Backup jetzt erstellen"}
      </Button>
      {error && <p className="text-[12.5px] font-medium text-pill-red-fg">{error}</p>}
    </div>
  );
}

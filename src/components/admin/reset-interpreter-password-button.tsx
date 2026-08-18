"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { resetInterpreterPasswordAction } from "@/lib/actions/interpreter-actions";

export function ResetInterpreterPasswordButton({ interpreterId }: { interpreterId: string }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run() {
    setError(null);
    setOpen(true);
    startTransition(async () => {
      const res = await resetInterpreterPasswordAction(interpreterId);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setResult(res);
      router.refresh();
    });
  }

  function close() {
    setOpen(false);
    setResult(null);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={run}
        className="rounded-full border border-field-border bg-white px-2.5 py-1 text-[11.5px] font-semibold text-text-secondary transition hover:bg-field-bg"
      >
        Zugang zurücksetzen
      </button>
      <Modal open={open} onClose={close} title="Neuer Zugang">
        <div className="flex flex-col gap-3">
          {pending && <p className="text-sm text-text-secondary">Wird erstellt…</p>}
          {error && <p className="text-[12.5px] font-medium text-pill-red-fg">{error}</p>}
          {result && (
            <>
              <p className="text-sm text-text-secondary">
                Neue Zugangsdaten für die Dolmetscher-App (bitte weitergeben — beim nächsten Login muss ein
                eigenes Passwort vergeben werden). Das alte Passwort funktioniert ab jetzt nicht mehr.
              </p>
              <div className="rounded-[10px] bg-field-bg-alt p-3 text-sm">
                <div>
                  E-Mail: <span className="font-mono font-semibold">{result.email}</span>
                </div>
                <div>
                  Temp.-Passwort: <span className="font-mono font-semibold">{result.tempPassword}</span>
                </div>
              </div>
            </>
          )}
          <Button variant="primary" onClick={close} disabled={pending}>
            Fertig
          </Button>
        </div>
      </Modal>
    </>
  );
}

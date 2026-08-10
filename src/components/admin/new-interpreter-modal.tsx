"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { createInterpreterAction } from "@/lib/actions/interpreter-actions";

export function NewInterpreterModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [langs, setLangs] = useState("");
  const [salutation, setSalutation] = useState<"HERR" | "FRAU">("FRAU");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ humanId: string; email: string; tempPassword: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function close() {
    setOpen(false);
    setName("");
    setLangs("");
    setError(null);
    setCreated(null);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await createInterpreterAction({
        name,
        salutation,
        langs: langs.split(",").map((l) => l.trim()).filter(Boolean),
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setCreated(result);
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        + Neuer Dolmetscher
      </Button>
      <Modal open={open} onClose={close} title={created ? "Dolmetscher angelegt" : "Neuer Dolmetscher"}>
        {created ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-text-secondary">
              <span className="font-bold text-text-primary">{created.humanId}</span> wurde angelegt. Zugangsdaten
              für die Dolmetscher-App (bitte weitergeben — beim ersten Login muss ein eigenes Passwort vergeben
              werden):
            </p>
            <div className="rounded-[10px] bg-field-bg-alt p-3 text-sm">
              <div>
                E-Mail: <span className="font-mono font-semibold">{created.email}</span>
              </div>
              <div>
                Temp.-Passwort: <span className="font-mono font-semibold">{created.tempPassword}</span>
              </div>
            </div>
            <Button variant="primary" onClick={close}>
              Fertig
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-xs text-text-secondary">Anrede</label>
              <Segmented
                options={[
                  { value: "HERR", label: "Herr" },
                  { value: "FRAU", label: "Frau" },
                ]}
                value={salutation}
                onChange={setSalutation}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-text-secondary">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vor- und Nachname"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-text-secondary">Sprachen</label>
              <Input
                value={langs}
                onChange={(e) => setLangs(e.target.value)}
                placeholder="z.B. DE, TR"
              />
            </div>
            {error && <p className="text-[12.5px] font-medium text-pill-red-fg">{error}</p>}
            <div className="mt-2 flex gap-2.5">
              <Button variant="secondary" className="flex-1" onClick={close}>
                Abbrechen
              </Button>
              <Button variant="primary" className="flex-1" onClick={save} disabled={pending || !name || !langs}>
                {pending ? "Wird angelegt…" : "Anlegen"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

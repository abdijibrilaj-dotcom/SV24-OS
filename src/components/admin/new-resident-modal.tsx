"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createResidentAction } from "@/lib/actions/resident-actions";
import { serviceTypeMeta } from "@/lib/status";
import type { ServiceType } from "@prisma/client";

const SELECT_CLASSES =
  "w-full rounded-[10px] border border-field-border bg-field-bg-alt px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-[#93C5FD] focus:bg-white focus:ring-4 focus:ring-[#DBEAFE]";

export function NewResidentModal({ clients }: { clients: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [langs, setLangs] = useState("");
  const [clientId, setClientId] = useState("");
  const [contact, setContact] = useState("");
  const [initialService, setInitialService] = useState<ServiceType>("DOLMETSCHEN");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function close() {
    setOpen(false);
    setName("");
    setLangs("");
    setClientId("");
    setContact("");
    setInitialService("DOLMETSCHEN");
    setError(null);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await createResidentAction({
        name,
        langs: langs.split(",").map((l) => l.trim()).filter(Boolean),
        clientId: clientId || undefined,
        contact: contact || undefined,
        initialService,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      close();
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        + Neuer Fall
      </Button>
      <Modal open={open} onClose={close} title="Neuer Fall">
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-text-secondary">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- und Nachname" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-text-secondary">Sprachen</label>
            <Input value={langs} onChange={(e) => setLangs(e.target.value)} placeholder="z.B. Arabisch, Farsi" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-text-secondary">Unterkunft / Auftraggeber (optional)</label>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={SELECT_CLASSES}>
              <option value="">— keine Zuordnung —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-text-secondary">Kontakt (optional)</label>
            <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Telefon oder E-Mail" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-text-secondary">Erste Leistung</label>
            <select
              value={initialService}
              onChange={(e) => setInitialService(e.target.value as ServiceType)}
              className={SELECT_CLASSES}
            >
              {Object.entries(serviceTypeMeta).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-[12.5px] font-medium text-pill-red-fg">{error}</p>}
        </div>
        <div className="mt-5 flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={close}>
            Abbrechen
          </Button>
          <Button variant="primary" className="flex-1" onClick={save} disabled={pending || !name}>
            {pending ? "Wird angelegt…" : "Anlegen"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAppointmentAction } from "@/lib/actions/appointment-actions";

export function NewAppointmentModal({ defaultDate }: { defaultDate: string }) {
  const [open, setOpen] = useState(false);
  const [client, setClient] = useState("");
  const [interpreter, setInterpreter] = useState("");
  const [street, setStreet] = useState("");
  const [zip, setZip] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function close() {
    setOpen(false);
    setClient("");
    setInterpreter("");
    setStreet("");
    setZip("");
    setTime("");
    setError(null);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await createAppointmentAction({ client, interpreter, street, zip, date, time });
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
        + Neuer Termin
      </Button>
      <Modal open={open} onClose={close} title="Neuer Termin">
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-text-secondary">Kunde</label>
            <Input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="z.B. Stadtgericht München"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-text-secondary">Dolmetscher</label>
            <Input
              value={interpreter}
              onChange={(e) => setInterpreter(e.target.value)}
              placeholder="Name oder – noch offen –"
            />
          </div>
          <div className="flex gap-2.5">
            <div className="flex-[2]">
              <label className="mb-1.5 block text-xs text-text-secondary">Straße</label>
              <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Straße, Hausnummer" />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs text-text-secondary">PLZ</label>
              <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="10115" />
            </div>
          </div>
          <div className="flex gap-2.5">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs text-text-secondary">Datum</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs text-text-secondary">Uhrzeit</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-[12.5px] font-medium text-pill-red-fg">{error}</p>}
        </div>
        <div className="mt-5 flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={close}>
            Abbrechen
          </Button>
          <Button variant="primary" className="flex-1" onClick={save} disabled={pending || !client || !date || !time}>
            {pending ? "Wird angelegt…" : "Anlegen"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

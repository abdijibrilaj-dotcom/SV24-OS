"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAppointmentAction } from "@/lib/actions/appointment-actions";

export default function BuchungPage() {
  const [client, setClient] = useState("");
  const [interpreter, setInterpreter] = useState("");
  const [langPair, setLangPair] = useState("");
  const [type, setType] = useState("");
  const [street, setStreet] = useState("");
  const [zip, setZip] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await createAppointmentAction({ client, interpreter, street, zip, date, time, langPair, type });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/buero/jobs");
    });
  }

  return (
    <MobileScreen header={{ mode: "back", title: "Neue Buchung", backHref: "/buero/jobs" }} tabBar={undefined}>
      <div className="flex flex-col gap-3">
        <div>
          <Label>Kunde</Label>
          <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="z.B. Stadtgericht München" />
        </div>
        <div>
          <Label>Dolmetscher</Label>
          <Input
            value={interpreter}
            onChange={(e) => setInterpreter(e.target.value)}
            placeholder="Name oder – noch offen –"
          />
        </div>
        <div className="flex gap-2.5">
          <div className="flex-1">
            <Label>Sprachpaar</Label>
            <Input value={langPair} onChange={(e) => setLangPair(e.target.value)} placeholder="DE ↔ TR" />
          </div>
          <div className="flex-1">
            <Label>Art</Label>
            <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Vor Ort" />
          </div>
        </div>
        <div className="flex gap-2.5">
          <div className="flex-[2]">
            <Label>Straße</Label>
            <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Straße, Hausnummer" />
          </div>
          <div className="flex-1">
            <Label>PLZ</Label>
            <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="10115" />
          </div>
        </div>
        <div className="flex gap-2.5">
          <div className="flex-1">
            <Label>Datum</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <Label>Uhrzeit</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        {error && <p className="text-[12.5px] font-medium text-pill-red-fg">{error}</p>}
        <Button variant="dark" className="mt-2 w-full py-3.5" onClick={save} disabled={pending || !client || !date || !time}>
          {pending ? "Wird gespeichert…" : "Buchung anlegen"}
        </Button>
      </div>
    </MobileScreen>
  );
}

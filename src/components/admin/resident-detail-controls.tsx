"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  addCaseNoteAction,
  setResidentStatusAction,
  toggleResidentServiceAction,
} from "@/lib/actions/resident-actions";
import { serviceTypeMeta } from "@/lib/status";
import type { ServiceType, ResidentStatus } from "@prisma/client";

const ALL_SERVICES = Object.keys(serviceTypeMeta) as ServiceType[];

export function ServiceToggles({ residentId, active }: { residentId: string; active: ServiceType[] }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const activeSet = new Set(active);

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_SERVICES.map((type) => {
        const isActive = activeSet.has(type);
        return (
          <button
            key={type}
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await toggleResidentServiceAction(residentId, type, !isActive);
                router.refresh();
              })
            }
            className={
              isActive
                ? "rounded-full bg-navy px-3 py-1.5 text-[12.5px] font-bold text-white transition"
                : "rounded-full border border-field-border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-text-secondary transition hover:bg-field-bg"
            }
          >
            {serviceTypeMeta[type].label}
          </button>
        );
      })}
    </div>
  );
}

export function ResidentStatusButton({ residentId, status }: { residentId: string; status: ResidentStatus }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const next: ResidentStatus = status === "AKTIV" ? "ABGESCHLOSSEN" : "AKTIV";

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setResidentStatusAction(residentId, next);
          router.refresh();
        })
      }
    >
      {pending ? "…" : next === "ABGESCHLOSSEN" ? "Fall abschließen" : "Fall wieder aktivieren"}
    </Button>
  );
}

export function CaseNoteForm({ residentId, services }: { residentId: string; services: ServiceType[] }) {
  const [text, setText] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>(services[0] ?? "DOLMETSCHEN");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    startTransition(async () => {
      await addCaseNoteAction(residentId, serviceType, text);
      setText("");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2.5">
      <select
        value={serviceType}
        onChange={(e) => setServiceType(e.target.value as ServiceType)}
        className="w-fit rounded-[10px] border border-field-border bg-field-bg-alt px-3 py-2 text-[12.5px] outline-none"
      >
        {(services.length > 0 ? services : ALL_SERVICES).map((type) => (
          <option key={type} value={type}>
            {serviceTypeMeta[type].label}
          </option>
        ))}
      </select>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Neue Notiz zum Fall…"
        rows={3}
        className="w-full resize-none rounded-[10px] border border-field-border bg-field-bg-alt px-3 py-2.5 text-sm outline-none transition focus:border-[#93C5FD] focus:bg-white focus:ring-4 focus:ring-[#DBEAFE]"
      />
      <Button variant="primary" className="self-start" disabled={pending || !text.trim()} onClick={submit}>
        {pending ? "Wird gespeichert…" : "Notiz hinzufügen"}
      </Button>
    </div>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ServiceToggles,
  ResidentStatusButton,
  CaseNoteForm,
} from "@/components/admin/resident-detail-controls";
import { residentStatusMeta, serviceTypeMeta } from "@/lib/status";
import { formatDate } from "@/lib/format";
import { MessageSquare } from "lucide-react";

export default async function FallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const resident = await prisma.resident.findUnique({
    where: { id },
    include: {
      client: true,
      services: true,
      notes: { orderBy: { createdAt: "desc" }, include: { author: true } },
    },
  });
  if (!resident) notFound();

  const statusMeta = residentStatusMeta[resident.status];
  const activeServices = resident.services.map((s) => s.type);

  return (
    <div className="grid max-w-4xl gap-5">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-text-tertiary">{resident.humanId}</div>
            <div className="mt-0.5 text-[19px] font-extrabold">{resident.name}</div>
            <div className="mt-1 text-[13px] text-text-secondary">
              {resident.langs.join(", ") || "—"}
              {resident.client && <> · {resident.client.name}</>}
              {resident.contact && <> · {resident.contact}</>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone={statusMeta.tone}>{statusMeta.label}</Pill>
            <ResidentStatusButton residentId={resident.id} status={resident.status} />
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 text-[13px] font-bold">Leistungen</div>
        <ServiceToggles residentId={resident.id} active={activeServices} />
      </Card>

      <Card>
        <div className="mb-3 text-[13px] font-bold">Neue Notiz</div>
        <CaseNoteForm residentId={resident.id} services={activeServices} />
      </Card>

      <Card>
        <div className="mb-3 text-[13px] font-bold">Verlauf</div>
        <div className="flex flex-col gap-3">
          {resident.notes.map((n) => (
            <div key={n.id} className="rounded-xl border border-field-border p-3">
              <div className="mb-1.5 flex items-center gap-2">
                <Pill tone={serviceTypeMeta[n.serviceType].tone}>{serviceTypeMeta[n.serviceType].label}</Pill>
                <div className="text-[11px] text-text-tertiary">
                  {formatDate(n.createdAt)} {n.author ? `· ${n.author.name}` : ""}
                </div>
              </div>
              <div className="whitespace-pre-wrap text-[13px]">{n.text}</div>
            </div>
          ))}
          {resident.notes.length === 0 && <EmptyState icon={MessageSquare} title="Noch keine Einträge im Verlauf." />}
        </div>
      </Card>
    </div>
  );
}

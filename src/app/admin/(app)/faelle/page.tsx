import { HeartHandshake } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { EmptyState } from "@/components/ui/empty-state";
import { NewResidentModal } from "@/components/admin/new-resident-modal";
import { residentStatusMeta, serviceTypeMeta } from "@/lib/status";
import Link from "next/link";

export default async function FaellePage() {
  const [residents, clients] = await Promise.all([
    prisma.resident.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, services: true },
    }),
    prisma.client.findMany({ where: { status: "AKTIV" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="max-w-[60ch] text-[13px] text-text-secondary">
          Fallakten für Leistungen über das Dolmetschen hinaus (Sozialbetreuung, Sprachkurse, ...). Ein Fall kann
          mehrere Leistungsarten gleichzeitig haben.
        </div>
        <NewResidentModal clients={clients} />
      </div>
      <Card padded={false}>
        <div className="overflow-x-auto px-5 pb-1 pt-2">
          <table className="w-full min-w-[760px] border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b-[1.5px] border-[#F1F2F4] text-left text-[11px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
                <th className="px-1 py-3">ID</th>
                <th className="px-1 py-3">Name</th>
                <th className="px-1 py-3">Sprachen</th>
                <th className="px-1 py-3">Unterkunft</th>
                <th className="px-1 py-3">Leistungen</th>
                <th className="px-1 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((r) => {
                const statusMeta = residentStatusMeta[r.status];
                return (
                  <tr key={r.id} className="border-t border-[#F1F2F4] hover:bg-[#FAFAFB]">
                    <td className="px-1 py-2.5 font-semibold text-text-secondary">
                      <Link href={`/admin/faelle/${r.id}`} className="hover:underline">
                        {r.humanId}
                      </Link>
                    </td>
                    <td className="px-1 py-2.5">
                      <Link href={`/admin/faelle/${r.id}`} className="font-medium hover:underline">
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-1 py-2.5">{r.langs.join(", ") || "—"}</td>
                    <td className="px-1 py-2.5">{r.client?.name ?? "—"}</td>
                    <td className="px-1 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {r.services.map((s) => (
                          <Pill key={s.id} tone={serviceTypeMeta[s.type].tone}>
                            {serviceTypeMeta[s.type].label}
                          </Pill>
                        ))}
                      </div>
                    </td>
                    <td className="px-1 py-2.5">
                      <Pill tone={statusMeta.tone}>{statusMeta.label}</Pill>
                    </td>
                  </tr>
                );
              })}
              {residents.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon={HeartHandshake} title="Noch keine Fälle angelegt." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

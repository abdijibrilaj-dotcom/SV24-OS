import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { clientStatusMeta } from "@/lib/status";
import { formatEUR } from "@/lib/format";

export default async function AuftraggeberPage() {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { jobs: { where: { status: { in: ["PENDING", "CONFIRMED"] } } } } },
      invoices: { where: { date: { gte: yearStart } }, select: { amount: true } },
    },
  });

  return (
    <Card padded={false}>
      <div className="overflow-x-auto px-5 pb-1 pt-2">
        <table className="w-full min-w-[680px] border-collapse text-[13.5px]">
          <thead>
            <tr className="border-b-[1.5px] border-[#F1F2F4] text-left text-[11px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
              <th className="px-1 py-3">Kunde</th>
              <th className="px-1 py-3">Ansprechpartner</th>
              <th className="px-1 py-3">Aktive Aufträge</th>
              <th className="px-1 py-3">Umsatz (YTD)</th>
              <th className="px-1 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const meta = clientStatusMeta[c.status];
              const revenue = c.invoices.reduce((sum, i) => sum + Number(i.amount), 0);
              return (
                <tr key={c.id} className="border-t border-[#F1F2F4] hover:bg-[#FAFAFB]">
                  <td className="px-1 py-2.5 font-medium">{c.name}</td>
                  <td className="px-1 py-2.5">{c.contact}</td>
                  <td className="px-1 py-2.5">{c._count.jobs}</td>
                  <td className="px-1 py-2.5 font-semibold">{formatEUR(revenue)}</td>
                  <td className="px-1 py-2.5">
                    <Pill tone={meta.tone}>{meta.label}</Pill>
                  </td>
                </tr>
              );
            })}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-tertiary">
                  Noch keine Auftraggeber angelegt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

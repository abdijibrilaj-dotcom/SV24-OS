import Link from "next/link";
import clsx from "clsx";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { invoiceStatusMeta } from "@/lib/status";
import { formatEUR, formatDate } from "@/lib/format";
import { markInvoicePaidAction } from "@/lib/actions/invoice-actions";
import type { InvoiceStatus } from "@prisma/client";

const FILTERS: { value: string; label: string; status?: InvoiceStatus }[] = [
  { value: "alle", label: "Alle" },
  { value: "offen", label: "Offen", status: "OFFEN" },
  { value: "ueberfaellig", label: "Überfällig", status: "UEBERFAELLIG" },
  { value: "bezahlt", label: "Bezahlt", status: "BEZAHLT" },
];

export default async function RechnungenPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "alle" } = await searchParams;
  const active = FILTERS.find((f) => f.value === filter) ?? FILTERS[0];

  const [sums, invoices, integration] = await Promise.all([
    prisma.invoice.groupBy({
      by: ["status"],
      _sum: { amount: true },
    }),
    prisma.invoice.findMany({
      where: active.status ? { status: active.status } : undefined,
      include: { client: true },
      orderBy: { date: "desc" },
    }),
    prisma.integrationSettings.findUnique({ where: { id: 1 } }),
  ]);

  const sumFor = (status: InvoiceStatus) =>
    Number(sums.find((s) => s.status === status)?._sum.amount ?? 0);
  const openSum = sumFor("OFFEN") + sumFor("UEBERFAELLIG");
  const overdueSum = sumFor("UEBERFAELLIG");
  const paidSum = sumFor("BEZAHLT");

  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-field-border bg-field-bg-alt p-3">
        <Pill tone={integration?.sevdeskConnected ? "green" : "gray"}>
          {integration?.sevdeskConnected ? "sevDesk verbunden" : "sevDesk nicht verbunden"}
        </Pill>
        <div className="text-[12.5px] text-text-secondary">
          {integration?.sevdeskConnected
            ? "Rechnungen werden mit sevDesk synchronisiert."
            : "Anbindung vorbereitet, aktuell nicht produktiv verbunden."}
        </div>
        <div className="flex-1" />
        <Link
          href="/admin/einstellungen"
          className="whitespace-nowrap text-[12.5px] font-semibold text-[#334155]"
        >
          Zu Integrationen →
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3.5">
        <Card>
          <div className="text-xs font-medium text-text-secondary">Offener Betrag</div>
          <div className="mt-1 text-[25px] font-extrabold">{formatEUR(openSum)}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-text-secondary">Davon überfällig</div>
          <div className="mt-1 text-[25px] font-extrabold text-pill-red-fg">{formatEUR(overdueSum)}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-text-secondary">Bezahlt (Zeitraum)</div>
          <div className="mt-1 text-[25px] font-extrabold text-pill-green-fg">{formatEUR(paidSum)}</div>
        </Card>
      </div>

      <div className="mb-4 inline-flex rounded-[10px] border border-field-border bg-white p-[3px]">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/rechnungen?filter=${f.value}`}
            className={clsx(
              "rounded-[8px] px-4 py-2 text-[13px] font-bold transition",
              active.value === f.value ? "bg-navy text-white" : "text-text-secondary hover:bg-field-bg"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto px-5 pb-1 pt-2">
          <table className="w-full min-w-[760px] border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b-[1.5px] border-[#F1F2F4] text-left text-[11px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
                <th className="px-1 py-3">Rechnungsnr.</th>
                <th className="px-1 py-3">Kunde</th>
                <th className="px-1 py-3">Datum</th>
                <th className="px-1 py-3">Fällig am</th>
                <th className="px-1 py-3">Betrag</th>
                <th className="px-1 py-3">Status</th>
                <th className="px-1 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const meta = invoiceStatusMeta[inv.status];
                return (
                  <tr key={inv.id} className="border-t border-[#F1F2F4] hover:bg-[#FAFAFB]">
                    <td className="px-1 py-2.5 font-semibold">{inv.number}</td>
                    <td className="px-1 py-2.5">{inv.client.name}</td>
                    <td className="px-1 py-2.5">{formatDate(inv.date)}</td>
                    <td className="px-1 py-2.5">{formatDate(inv.dueDate)}</td>
                    <td className="px-1 py-2.5 font-semibold">{formatEUR(Number(inv.amount), true)}</td>
                    <td className="px-1 py-2.5">
                      <Pill tone={meta.tone}>{meta.label}</Pill>
                    </td>
                    <td className="px-1 py-2.5">
                      {inv.status !== "BEZAHLT" && (
                        <form action={markInvoicePaidAction.bind(null, inv.id)}>
                          <button className="text-[12.5px] font-semibold text-[#334155]" type="submit">
                            Als bezahlt markieren
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-tertiary">
                    Keine Rechnungen in dieser Ansicht.
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

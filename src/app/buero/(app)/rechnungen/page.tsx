import { prisma } from "@/lib/prisma";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { BueroTabBar } from "@/components/buero/buero-tab-bar";
import { CardMobile } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { invoiceStatusMeta } from "@/lib/status";
import { formatEUR, formatDateShort } from "@/lib/format";
import { markInvoicePaidAction } from "@/lib/actions/invoice-actions";

export default async function BueroRechnungenPage() {
  const invoices = await prisma.invoice.findMany({
    include: { client: true },
    orderBy: { date: "desc" },
    take: 30,
  });

  return (
    <MobileScreen
      header={{ mode: "brand", notifHref: "/buero/benachrichtigungen", unreadCount: 0 }}
      tabBar={<BueroTabBar />}
    >
      <div className="mb-4 text-[18px] font-extrabold">Rechnungen</div>
      {invoices.map((inv) => {
        const meta = invoiceStatusMeta[inv.status];
        return (
          <CardMobile key={inv.id} className="mb-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[13.5px] font-bold">{inv.number}</div>
                <div className="mt-0.5 text-xs text-text-secondary">{inv.client.name}</div>
              </div>
              <Pill tone={meta.tone}>{meta.label}</Pill>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-text-tertiary">
                Fällig {formatDateShort(inv.dueDate)}
              </div>
              <div className="text-sm font-bold">{formatEUR(Number(inv.amount), true)}</div>
            </div>
            {inv.status !== "BEZAHLT" && (
              <form action={markInvoicePaidAction.bind(null, inv.id)} className="mt-2">
                <button type="submit" className="text-xs font-semibold text-[#334155]">
                  Als bezahlt markieren
                </button>
              </form>
            )}
          </CardMobile>
        );
      })}
      {invoices.length === 0 && (
        <div className="py-6 text-center text-[13px] text-text-tertiary">Keine Rechnungen.</div>
      )}
    </MobileScreen>
  );
}

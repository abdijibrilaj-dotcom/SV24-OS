import { FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { BueroTabBar } from "@/components/buero/buero-tab-bar";
import { CardMobile } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill } from "@/components/ui/pill";
import { SubmitButton } from "@/components/ui/submit-button";
import { invoiceStatusMeta } from "@/lib/status";
import { formatEUR, formatDateShort } from "@/lib/format";
import { markInvoicePaidAction } from "@/lib/actions/invoice-actions";
import { getUnreadCount } from "@/lib/queries/notifications";

export default async function BueroRechnungenPage() {
  const session = await auth();
  const [invoices, unreadCount] = await Promise.all([
    prisma.invoice.findMany({
      include: { client: true },
      orderBy: { date: "desc" },
      take: 30,
    }),
    getUnreadCount(session!.user.id),
  ]);

  return (
    <MobileScreen
      header={{ mode: "brand", notifHref: "/buero/benachrichtigungen", unreadCount }}
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
                <SubmitButton variant="link" className="text-xs" pendingText="Wird markiert…">
                  Als bezahlt markieren
                </SubmitButton>
              </form>
            )}
          </CardMobile>
        );
      })}
      {invoices.length === 0 && <EmptyState icon={FileText} title="Keine Rechnungen." />}
    </MobileScreen>
  );
}

import Link from "next/link";
import { Wallet } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { InterpreterTabBar } from "@/components/interpreter/interpreter-tab-bar";
import { CardMobile } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatEUR, formatDate } from "@/lib/format";
import { getUnreadCount } from "@/lib/queries/notifications";

export default async function InterpreterAuszahlungenPage() {
  const session = await auth();
  const interpreterId = session!.user.interpreterId!;

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [payouts, unreadCount] = await Promise.all([
    prisma.payout.findMany({
      where: { interpreterId },
      orderBy: { uploadedAt: "desc" },
    }),
    getUnreadCount(session!.user.id),
  ]);
  const yearSum = payouts
    .filter((p) => p.uploadedAt >= yearStart)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <MobileScreen
      header={{ mode: "brand", notifHref: "/interpreter/benachrichtigungen", unreadCount }}
      tabBar={<InterpreterTabBar />}
    >
      <div className="mb-4 rounded-2xl bg-navy p-5 text-white">
        <div className="text-xs opacity-70">Jahressumme {now.getFullYear()}</div>
        <div className="mt-1 text-[26px] font-extrabold">{formatEUR(yearSum)}</div>
        {payouts[0] && (
          <div className="mt-2 text-xs opacity-80">
            Letzte Gutschrift: {payouts[0].period} · {formatEUR(Number(payouts[0].amount))}
          </div>
        )}
      </div>

      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-text-tertiary">
        Gutschriften
      </div>
      {payouts.map((p) => (
        <Link key={p.id} href={`/interpreter/auszahlungen/${p.id}`}>
          <CardMobile className="mb-2.5 flex items-center justify-between gap-2">
            <div>
              <div className="text-[14px] font-bold">{p.period}</div>
              <div className="mt-0.5 text-xs text-text-tertiary">Hochgeladen am {formatDate(p.uploadedAt)}</div>
            </div>
            <div className="text-sm font-bold">{formatEUR(Number(p.amount))}</div>
          </CardMobile>
        </Link>
      ))}
      {payouts.length === 0 && <EmptyState icon={Wallet} title="Noch keine Gutschriften." />}
    </MobileScreen>
  );
}

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { InterpreterTabBar } from "@/components/interpreter/interpreter-tab-bar";
import { CardMobile } from "@/components/ui/card";
import { PushToggle } from "@/components/interpreter/push-toggle";
import { formatEUR } from "@/lib/format";
import { logoutAction } from "@/lib/actions/auth-actions";
import { getUnreadCount } from "@/lib/queries/notifications";

export default async function InterpreterProfilPage() {
  const session = await auth();
  const interpreterId = session!.user.interpreterId!;
  const interpreter = await prisma.interpreter.findUniqueOrThrow({ where: { id: interpreterId } });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [jobsThisMonth, payoutsThisMonth, unreadCount] = await Promise.all([
    prisma.job.count({
      where: { interpreterId, date: { gte: monthStart }, status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
    prisma.payout.aggregate({
      _sum: { amount: true },
      where: { interpreterId, uploadedAt: { gte: monthStart } },
    }),
    getUnreadCount(session!.user.id),
  ]);

  return (
    <MobileScreen
      header={{ mode: "brand", notifHref: "/interpreter/benachrichtigungen", unreadCount }}
      tabBar={<InterpreterTabBar />}
    >
      <div className="flex flex-col items-center gap-2.5 py-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-lg font-bold text-white">
          {interpreter.initials}
        </div>
        <div className="text-lg font-extrabold">{interpreter.name}</div>
        <span className="inline-flex items-center rounded-full bg-field-bg-alt px-2.5 py-1 text-[11px] font-bold text-text-secondary">
          #{interpreter.humanId}
        </span>
        <div className="text-xs text-text-secondary">{interpreter.langs.join(", ")} · {Number(interpreter.rating).toFixed(1)} ★</div>
      </div>

      <div className="my-5 grid grid-cols-3 gap-2">
        <CardMobile className="text-center">
          <div className="text-lg font-extrabold">{jobsThisMonth}</div>
          <div className="mt-0.5 text-[10px] text-text-secondary">Jobs (Monat)</div>
        </CardMobile>
        <CardMobile className="text-center">
          <div className="text-lg font-extrabold">{formatEUR(Number(payoutsThisMonth._sum.amount ?? 0))}</div>
          <div className="mt-0.5 text-[10px] text-text-secondary">Verdienst</div>
        </CardMobile>
        <CardMobile className="text-center">
          <div className="text-lg font-extrabold">{Number(interpreter.rating).toFixed(1)} ★</div>
          <div className="mt-0.5 text-[10px] text-text-secondary">Bewertung</div>
        </CardMobile>
      </div>

      <CardMobile className="mb-4" padded={false}>
        <Link href="/interpreter/dokumente" className="flex items-center justify-between px-4 py-3.5 border-b border-card-border-mobile">
          <span className="text-sm font-medium">Dokumente</span>
          <ChevronRight size={16} className="text-text-tertiary" />
        </Link>
        <Link href="/interpreter/auszahlungen" className="flex items-center justify-between px-4 py-3.5 border-b border-card-border-mobile">
          <span className="text-sm font-medium">Auszahlungen</span>
          <ChevronRight size={16} className="text-text-tertiary" />
        </Link>
        <a href="/api/interpreter/calendar.ics" className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm font-medium">Kalender exportieren (.ics)</span>
          <ChevronRight size={16} className="text-text-tertiary" />
        </a>
      </CardMobile>

      <CardMobile className="mb-4">
        <PushToggle />
      </CardMobile>

      <form action={logoutAction.bind(null, "interpreter")}>
        <button
          type="submit"
          className="w-full rounded-xl border border-field-border bg-white py-3 text-sm font-bold text-pill-red-fg"
        >
          Abmelden
        </button>
      </form>
    </MobileScreen>
  );
}

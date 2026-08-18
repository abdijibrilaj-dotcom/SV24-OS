import Link from "next/link";
import { Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { BueroTabBar } from "@/components/buero/buero-tab-bar";
import { CardMobile } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill } from "@/components/ui/pill";
import { jobStatusMeta } from "@/lib/status";
import { addDays, toISODate, formatDayLabel } from "@/lib/dates";
import { getUnreadCount } from "@/lib/queries/notifications";

export default async function BueroKalenderPage() {
  const session = await auth();
  const unreadCount = await getUnreadCount(session!.user.id);
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const rangeEnd = addDays(today, 14);

  const jobs = await prisma.job.findMany({
    where: { date: { gte: today, lt: rangeEnd } },
    include: { client: true, interpreter: true },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  const byDay = new Map<string, typeof jobs>();
  for (const job of jobs) {
    const iso = toISODate(job.date);
    byDay.set(iso, [...(byDay.get(iso) ?? []), job]);
  }

  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i)).filter((d) =>
    byDay.has(toISODate(d))
  );

  return (
    <MobileScreen
      header={{ mode: "brand", notifHref: "/buero/benachrichtigungen", unreadCount }}
      tabBar={<BueroTabBar />}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[18px] font-extrabold">Kalender</div>
        <Link href="/buero/buchung" className="text-xs font-semibold text-text-secondary">
          + Neue Buchung
        </Link>
      </div>

      {days.map((day) => {
        const iso = toISODate(day);
        const dayJobs = byDay.get(iso) ?? [];
        return (
          <div key={iso} className="mb-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
              {formatDayLabel(day)}
            </div>
            {dayJobs.map((job) => {
              const meta = jobStatusMeta[job.status];
              return (
                <Link key={job.id} href={`/buero/jobs/${job.id}`}>
                  <CardMobile className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[13.5px] font-bold">{job.client.name}</div>
                      <div className="text-xs text-text-secondary">
                        {job.time} · {job.interpreter?.name ?? "— offen —"}
                      </div>
                    </div>
                    <Pill tone={meta.tone}>{meta.label}</Pill>
                  </CardMobile>
                </Link>
              );
            })}
          </div>
        );
      })}
      {days.length === 0 && (
        <EmptyState icon={Calendar} title="Keine Termine in den nächsten 14 Tagen." />
      )}
    </MobileScreen>
  );
}

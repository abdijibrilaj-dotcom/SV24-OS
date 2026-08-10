import Link from "next/link";
import { auth } from "@/lib/auth";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { BueroTabBar } from "@/components/buero/buero-tab-bar";
import { CardMobile } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { getBueroHomeData } from "@/lib/queries/buero";
import { jobStatusMeta } from "@/lib/status";
import { formatDateShort } from "@/lib/format";

export default async function BueroHomePage() {
  const session = await auth();
  const data = await getBueroHomeData(session!.user.id);
  const firstName = session!.user.name?.split(" ")[0] ?? "";
  const unread = data.notifications.filter((n) => n.unread).length;

  return (
    <MobileScreen
      header={{ mode: "brand", notifHref: "/buero/benachrichtigungen", unreadCount: unread }}
      tabBar={<BueroTabBar />}
    >
      <div className="text-xs text-text-secondary">
        {new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "2-digit", month: "long" }).format(new Date())}
      </div>
      <div className="mb-4 mt-0.5 text-[21px] font-extrabold">Guten Tag, {firstName}</div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        <CardMobile className="text-center">
          <div className="text-xl font-extrabold">{data.jobsToday}</div>
          <div className="mt-0.5 text-[10px] text-text-secondary">Jobs heute</div>
        </CardMobile>
        <CardMobile className="text-center">
          <div className="text-xl font-extrabold">{data.openInvoices}</div>
          <div className="mt-0.5 text-[10px] text-text-secondary">Offene Rechn.</div>
        </CardMobile>
        <CardMobile className="text-center">
          <div className="text-xl font-extrabold">{data.newRequests}</div>
          <div className="mt-0.5 text-[10px] text-text-secondary">Neue Anfr.</div>
        </CardMobile>
      </div>

      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-text-tertiary">
        Nächste Termine
      </div>
      {data.upcoming.map((job) => {
        const meta = jobStatusMeta[job.status];
        return (
          <Link key={job.id} href={`/buero/jobs/${job.id}`}>
            <CardMobile className="mb-2.5 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[14.5px] font-bold">{job.client.name}</div>
                <Pill tone={meta.tone}>{meta.label}</Pill>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs text-text-secondary">
                <span>{job.langPair}</span>
                <span>·</span>
                <span>{job.type}</span>
                <span>·</span>
                <span>{formatDateShort(job.date)}, {job.time}</span>
              </div>
            </CardMobile>
          </Link>
        );
      })}
      {data.upcoming.length === 0 && (
        <div className="py-3 text-[13px] text-text-tertiary">Keine anstehenden Termine.</div>
      )}

      <div className="mb-2 mt-4 flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-text-tertiary">Aktivität</div>
        <Link href="/buero/benachrichtigungen" className="text-xs font-semibold text-text-secondary">
          Alle anzeigen
        </Link>
      </div>
      {data.notifications.map((n) => (
        <div key={n.id} className="flex items-start gap-2 border-b border-card-border-mobile py-2 last:border-0">
          <div className={n.unread ? "mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2563EB]" : "mt-1.5 h-1.5 w-1.5 flex-shrink-0"} />
          <div>
            <div className="text-[13px]">{n.text}</div>
            <div className="mt-0.5 text-[11px] text-text-tertiary">{formatDateShort(n.createdAt)}</div>
          </div>
        </div>
      ))}
    </MobileScreen>
  );
}

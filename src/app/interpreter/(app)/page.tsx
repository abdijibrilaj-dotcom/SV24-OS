import Link from "next/link";
import { Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { InterpreterTabBar } from "@/components/interpreter/interpreter-tab-bar";
import { CardMobile } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getInterpreterHomeData } from "@/lib/queries/interpreter";
import { formatDateShort } from "@/lib/format";
import { confirmJobAction, declineJobAction } from "@/lib/actions/job-actions";
import { IncomingJobBanner } from "@/components/interpreter/incoming-job-banner";

export default async function InterpreterHomePage() {
  const session = await auth();
  const interpreterId = session!.user.interpreterId!;
  const data = await getInterpreterHomeData(interpreterId);

  const unread = await prisma.notification.count({
    where: { userId: session!.user.id, unread: true },
  });

  const firstName = data.interpreter.name.split(" ")[0];
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const freshJob = data.pendingJobs.find((j) => j.createdAt >= fiveMinAgo);

  return (
    <MobileScreen
      header={{ mode: "brand", notifHref: "/interpreter/benachrichtigungen", unreadCount: unread }}
      tabBar={<InterpreterTabBar />}
    >
      {freshJob && (
        <IncomingJobBanner
          jobId={freshJob.id}
          text={`${freshJob.client.name} · ${freshJob.type}, ${freshJob.time}`}
        />
      )}

      <div className="text-xs text-text-secondary">
        {new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "2-digit", month: "long" }).format(new Date())}
      </div>
      <div className="mb-4 mt-0.5 text-[21px] font-extrabold">Guten Tag, {firstName}</div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        <CardMobile className="text-center">
          <div className="text-xl font-extrabold">{data.jobsThisWeek}</div>
          <div className="mt-0.5 text-[10px] text-text-secondary">Jobs Woche</div>
        </CardMobile>
        <CardMobile className="text-center">
          <div className="text-xl font-extrabold">{Number(data.interpreter.rating).toFixed(1)} ★</div>
          <div className="mt-0.5 text-[10px] text-text-secondary">Bewertung</div>
        </CardMobile>
        <CardMobile className="text-center">
          <div className="text-xl font-extrabold">{data.pendingCount}</div>
          <div className="mt-0.5 text-[10px] text-text-secondary">Zu bestätigen</div>
        </CardMobile>
      </div>

      {data.pendingJobs.length > 0 && (
        <>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-text-tertiary">
            Bestätigung ausstehend
          </div>
          {data.pendingJobs.map((job) => (
            <CardMobile key={job.id} className="mb-2.5 flex flex-col gap-2.5">
              <Link href={`/interpreter/jobs/${job.id}`}>
                <div className="text-[14.5px] font-bold">{job.client.name}</div>
                <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-text-secondary">
                  <span>{job.langPair}</span>
                  <span>·</span>
                  <span>{job.type}</span>
                  <span>·</span>
                  <span>{formatDateShort(job.date)}, {job.time}</span>
                </div>
              </Link>
              <div className="flex gap-2">
                <form action={confirmJobAction.bind(null, job.id)} className="flex-1">
                  <button className="w-full rounded-[10px] bg-navy py-2 text-[13px] font-bold text-white" type="submit">
                    Bestätigen
                  </button>
                </form>
                <form action={declineJobAction.bind(null, job.id)} className="flex-1">
                  <button className="w-full rounded-[10px] border border-field-border py-2 text-[13px] font-bold text-text-secondary" type="submit">
                    Ablehnen
                  </button>
                </form>
              </div>
            </CardMobile>
          ))}
        </>
      )}

      <div className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-[0.06em] text-text-tertiary">
        Nächste Termine
      </div>
      {data.upcomingConfirmed.map((job) => (
        <Link key={job.id} href={`/interpreter/jobs/${job.id}`}>
          <CardMobile className="mb-2.5">
            <div className="text-[14.5px] font-bold">{job.client.name}</div>
            <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-text-secondary">
              <span>{job.langPair}</span>
              <span>·</span>
              <span>{job.type}</span>
              <span>·</span>
              <span>{formatDateShort(job.date)}, {job.time}</span>
            </div>
          </CardMobile>
        </Link>
      ))}
      {data.upcomingConfirmed.length === 0 && (
        <EmptyState icon={Calendar} title="Keine anstehenden Termine." />
      )}
    </MobileScreen>
  );
}

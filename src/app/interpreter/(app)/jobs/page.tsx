import Link from "next/link";
import clsx from "clsx";
import { Briefcase } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { InterpreterTabBar } from "@/components/interpreter/interpreter-tab-bar";
import { CardMobile } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill } from "@/components/ui/pill";
import { jobStatusMeta } from "@/lib/status";
import { formatDateShort } from "@/lib/format";
import { getUnreadCount } from "@/lib/queries/notifications";
import type { JobStatus } from "@prisma/client";

const FILTERS = [
  { value: "alle", label: "Alle" },
  { value: "offen", label: "Offen", status: "PENDING" as JobStatus },
  { value: "bestaetigt", label: "Bestätigt", status: "CONFIRMED" as JobStatus },
  { value: "erledigt", label: "Erledigt", status: "COMPLETED" as JobStatus },
];

export default async function InterpreterJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "alle" } = await searchParams;
  const active = FILTERS.find((f) => f.value === filter) ?? FILTERS[0];

  const session = await auth();
  const interpreterId = session!.user.interpreterId!;

  const [jobs, unreadCount] = await Promise.all([
    prisma.job.findMany({
      where: { interpreterId, ...(active.status ? { status: active.status } : {}) },
      include: { client: true },
      orderBy: [{ date: "desc" }, { time: "asc" }],
      take: 40,
    }),
    getUnreadCount(session!.user.id),
  ]);

  return (
    <MobileScreen
      header={{ mode: "brand", notifHref: "/interpreter/benachrichtigungen", unreadCount }}
      tabBar={<InterpreterTabBar />}
    >
      <div className="mb-4 inline-flex rounded-[10px] border border-field-border bg-white p-[3px]">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/interpreter/jobs?filter=${f.value}`}
            className={clsx(
              "rounded-[8px] px-3 py-1.5 text-[12.5px] font-bold transition",
              active.value === f.value ? "bg-navy text-white" : "text-text-secondary"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {jobs.map((job) => {
        const meta = jobStatusMeta[job.status];
        return (
          <Link key={job.id} href={`/interpreter/jobs/${job.id}`}>
            <CardMobile className="mb-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[14.5px] font-bold">{job.client.name}</div>
                <Pill tone={meta.tone}>{meta.label}</Pill>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-text-secondary">
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
      {jobs.length === 0 && <EmptyState icon={Briefcase} title="Keine Jobs." />}
    </MobileScreen>
  );
}

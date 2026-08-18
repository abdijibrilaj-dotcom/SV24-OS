import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import clsx from "clsx";
import { prisma } from "@/lib/prisma";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { BueroTabBar } from "@/components/buero/buero-tab-bar";
import { CardMobile } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill } from "@/components/ui/pill";
import { jobStatusMeta } from "@/lib/status";
import { formatDateShort } from "@/lib/format";
import type { JobStatus } from "@prisma/client";

const FILTERS = [
  { value: "alle", label: "Alle" },
  { value: "anstehend", label: "Anstehend" },
  { value: "erledigt", label: "Erledigt" },
] as const;

export default async function BueroJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "alle" } = await searchParams;
  const active = FILTERS.find((f) => f.value === filter) ?? FILTERS[0];

  const statusFilter: JobStatus[] | undefined =
    active.value === "anstehend"
      ? ["PENDING", "CONFIRMED"]
      : active.value === "erledigt"
        ? ["COMPLETED", "DECLINED"]
        : undefined;

  const jobs = await prisma.job.findMany({
    where: statusFilter ? { status: { in: statusFilter } } : undefined,
    include: { client: true, interpreter: true },
    orderBy: [{ date: "desc" }, { time: "asc" }],
    take: 40,
  });

  return (
    <MobileScreen
      header={{
        mode: "brand",
        action: (
          <Link
            href="/buero/buchung"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-navy text-white"
          >
            <Plus size={18} strokeWidth={2} />
          </Link>
        ),
      }}
      tabBar={<BueroTabBar />}
    >
      <div className="mb-4 inline-flex rounded-[10px] border border-field-border bg-white p-[3px]">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/buero/jobs?filter=${f.value}`}
            className={clsx(
              "rounded-[8px] px-3.5 py-1.5 text-[13px] font-bold transition",
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
                <span>
                  {formatDateShort(job.date)}, {job.time}
                </span>
              </div>
            </CardMobile>
          </Link>
        );
      })}
      {jobs.length === 0 && <EmptyState icon={Briefcase} title="Keine Aufträge." />}
    </MobileScreen>
  );
}

import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { Pill } from "@/components/ui/pill";
import { jobStatusMeta } from "@/lib/status";
import { formatDate } from "@/lib/format";
import { confirmJobAction, declineJobAction } from "@/lib/actions/job-actions";

export default async function InterpreterJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const job = await prisma.job.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!job || job.interpreterId !== session!.user.interpreterId) notFound();

  const meta = jobStatusMeta[job.status];

  return (
    <MobileScreen header={{ mode: "back", title: "Job-Detail", backHref: "/interpreter/jobs" }} tabBar={undefined}>
      <div className="rounded-2xl border border-card-border-mobile bg-white p-[18px] shadow-[var(--shadow-card-mobile)]">
        <div className="flex items-start justify-between gap-2.5">
          <div>
            <div className="text-[11px] font-semibold text-text-secondary">{job.langPair}</div>
            <div className="mt-0.5 text-[19px] font-extrabold">{job.client.name}</div>
          </div>
          <Pill tone={meta.tone}>{meta.label}</Pill>
        </div>
        <div className="mt-3.5 grid grid-cols-2 gap-3.5 text-[13px]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.04em] text-text-tertiary">Art</div>
            <div className="mt-0.5 font-medium">{job.type}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.04em] text-text-tertiary">Datum</div>
            <div className="mt-0.5 font-medium">{formatDate(job.date)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.04em] text-text-tertiary">Uhrzeit</div>
            <div className="mt-0.5 font-medium">{job.time}</div>
          </div>
          <div className="col-span-2">
            <div className="text-[10px] uppercase tracking-[0.04em] text-text-tertiary">Ort</div>
            <div className="mt-0.5 font-medium">{job.location}</div>
          </div>
        </div>
      </div>

      {job.status === "PENDING" && (
        <div className="mt-4 flex gap-2.5">
          <form action={confirmJobAction.bind(null, job.id)} className="flex-1">
            <button className="w-full rounded-xl bg-navy py-3 text-sm font-bold text-white" type="submit">
              Bestätigen
            </button>
          </form>
          <form action={declineJobAction.bind(null, job.id)} className="flex-1">
            <button className="w-full rounded-xl border border-field-border py-3 text-sm font-bold" type="submit">
              Ablehnen
            </button>
          </form>
        </div>
      )}
    </MobileScreen>
  );
}

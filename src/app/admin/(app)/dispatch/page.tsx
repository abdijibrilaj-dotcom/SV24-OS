import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { EmptyState } from "@/components/ui/empty-state";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDate } from "@/lib/format";
import { assignDispatchJobAction } from "@/lib/actions/dispatch-actions";

export default async function DispatchPage() {
  const jobs = await prisma.dispatchJob.findMany({
    where: { status: "OFFEN" },
    include: { client: true, interpreter: true },
    orderBy: { date: "asc" },
  });

  return (
    <div>
      <div className="mb-4 max-w-[60ch] text-[13px] text-text-secondary">
        Offene Aufträge mit automatischem Vorschlag auf Basis von Sprache, Verfügbarkeit und Bewertung.
      </div>
      {jobs.map((j) => {
        const suggested = j.interpreter?.name ?? j.suggestedName;
        return (
          <Card key={j.id} className="mb-3 flex items-center justify-between gap-4" padded={false}>
            <div className="flex flex-1 items-center justify-between gap-4 px-5 py-4">
              <div className="flex-1">
                <div className="text-[15px] font-bold">{j.client.name}</div>
                <div className="mt-1 text-[12.5px] text-text-secondary">
                  {j.langPair} · {formatDate(j.date)}, {j.time}
                </div>
              </div>
              <div className="min-w-[120px] text-right">
                <div className="text-[11px] text-text-tertiary">Vorschlag</div>
                <div className="text-[13.5px] font-bold">{suggested ?? "— kein Vorschlag —"}</div>
                {j.matchScore != null && (
                  <Pill tone="green" className="mt-1">
                    {j.matchScore}% Match
                  </Pill>
                )}
              </div>
              <form action={assignDispatchJobAction.bind(null, j.id)}>
                <SubmitButton disabled={!j.interpreterId} pendingText="Wird zugewiesen…">
                  Zuweisen
                </SubmitButton>
              </form>
            </div>
          </Card>
        );
      })}
      {jobs.length === 0 && (
        <Card>
          <EmptyState icon={CheckCircle2} title="Keine offenen Aufträge — alles zugewiesen." />
        </Card>
      )}
    </div>
  );
}

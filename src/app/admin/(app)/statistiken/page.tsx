import { Languages, Gauge } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill } from "@/components/ui/pill";
import { getWeeklyUtilization } from "@/lib/queries/utilization";
import { formatEUR } from "@/lib/format";

export default async function StatistikenPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [jobsThisMonth, activeInterpreters, avgRating, invoiceSum] = await Promise.all([
    prisma.job.count({ where: { date: { gte: monthStart } } }),
    prisma.interpreter.count({ where: { status: "AKTIV" } }),
    prisma.interpreter.aggregate({ _avg: { rating: true } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { date: { gte: monthStart } } }),
  ]);

  const languageCounts = await prisma.interpreter.findMany({ select: { langs: true } });
  const langTally = new Map<string, number>();
  for (const i of languageCounts) {
    for (const l of i.langs) langTally.set(l, (langTally.get(l) ?? 0) + 1);
  }
  const topLanguages = Array.from(langTally.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const utilization = await getWeeklyUtilization();

  return (
    <div>
      <div className="mb-6 grid grid-cols-4 gap-3.5">
        <StatCard label="Auftragsvolumen (Monat)" value={jobsThisMonth} />
        <StatCard label="Aktive Dolmetscher" value={activeInterpreters} />
        <StatCard label="Ø Bewertung" value={`${Number(avgRating._avg.rating ?? 0).toFixed(1)} ★`} />
        <StatCard label="Umsatz (Monat)" value={formatEUR(Number(invoiceSum._sum.amount ?? 0))} />
      </div>

      <Card>
        <div className="mb-3 text-[13px] font-bold">Sprachen im Pool</div>
        <div className="flex flex-col gap-2.5">
          {topLanguages.map(([lang, count]) => (
            <div key={lang} className="flex items-center gap-3">
              <div className="w-10 text-[12.5px] font-semibold">{lang}</div>
              <ProgressBar value={(count / topLanguages[0][1]) * 100} />
              <div className="w-6 text-right text-[12.5px] text-text-secondary">{count}</div>
            </div>
          ))}
          {topLanguages.length === 0 && (
            <EmptyState icon={Languages} title="Noch keine Dolmetscher angelegt." />
          )}
        </div>
      </Card>

      <Card className="mt-5">
        <div className="mb-1 text-[13px] font-bold">Auslastung diese Woche</div>
        <div className="mb-3 text-[12px] text-text-secondary">
          Zugewiesene Aufträge im Verhältnis zu den diese Woche angebotenen Tagen — dieselbe Fairness-Logik,
          die auch bei automatischen Zuweisungsvorschlägen greift.
        </div>
        <div className="flex flex-col gap-2.5">
          {utilization.map((row) => (
            <div key={row.interpreterId} className="flex items-center gap-3">
              <div className="w-32 truncate text-[12.5px] font-semibold">{row.name}</div>
              <ProgressBar value={row.loadPct} />
              <div className="w-16 text-right text-[12.5px] text-text-secondary">
                {row.assignedJobs}/{row.offeredDays}
              </div>
              {row.loadPct >= 100 ? (
                <Pill tone="red">Ausgelastet</Pill>
              ) : row.loadPct === 0 ? (
                <Pill tone="gray">Frei</Pill>
              ) : (
                <Pill tone="green">{row.loadPct}%</Pill>
              )}
            </div>
          ))}
          {utilization.length === 0 && <EmptyState icon={Gauge} title="Noch keine Dolmetscher angelegt." />}
        </div>
      </Card>
    </div>
  );
}

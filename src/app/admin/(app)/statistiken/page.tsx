import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
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

  return (
    <div>
      <div className="mb-6 grid grid-cols-4 gap-3.5">
        <Card>
          <div className="text-xs font-medium text-text-secondary">Auftragsvolumen (Monat)</div>
          <div className="mt-1 text-[25px] font-extrabold">{jobsThisMonth}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-text-secondary">Aktive Dolmetscher</div>
          <div className="mt-1 text-[25px] font-extrabold">{activeInterpreters}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-text-secondary">Ø Bewertung</div>
          <div className="mt-1 text-[25px] font-extrabold">{Number(avgRating._avg.rating ?? 0).toFixed(1)} ★</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-text-secondary">Umsatz (Monat)</div>
          <div className="mt-1 text-[25px] font-extrabold">{formatEUR(Number(invoiceSum._sum.amount ?? 0))}</div>
        </Card>
      </div>

      <Card>
        <div className="mb-3 text-[13px] font-bold">Sprachen im Pool</div>
        <div className="flex flex-col gap-2.5">
          {topLanguages.map(([lang, count]) => (
            <div key={lang} className="flex items-center gap-3">
              <div className="w-10 text-[12.5px] font-semibold">{lang}</div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-field-bg">
                <div
                  className="h-full rounded-full bg-navy"
                  style={{ width: `${(count / topLanguages[0][1]) * 100}%` }}
                />
              </div>
              <div className="w-6 text-right text-[12.5px] text-text-secondary">{count}</div>
            </div>
          ))}
          {topLanguages.length === 0 && (
            <div className="text-[13px] text-text-tertiary">Noch keine Dolmetscher angelegt.</div>
          )}
        </div>
      </Card>
    </div>
  );
}

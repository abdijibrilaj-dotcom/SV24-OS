import { ArrowUpRight, Percent, Briefcase, Inbox, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { EmptyState } from "@/components/ui/empty-state";
import { getDashboardData } from "@/lib/queries/dashboard";
import { formatEUR } from "@/lib/format";

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div>
      <div className="mb-6 grid grid-cols-4 gap-3.5">
        <Card>
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#EFF6FF] text-[#2563EB]">
            <ArrowUpRight size={16} strokeWidth={1.8} />
          </div>
          <div className="text-xs font-medium text-text-secondary">Umsatz (MTD)</div>
          <div className="mt-1 text-[25px] font-extrabold">{formatEUR(data.revenue)}</div>
          <Pill tone={data.revenueGrowthPct >= 0 ? "green" : "red"} className="mt-2">
            {data.revenueGrowthPct >= 0 ? "+" : ""}
            {data.revenueGrowthPct}% ggü. Vormonat
          </Pill>
        </Card>
        <Card>
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#ECFDF5] text-[#15803D]">
            <Percent size={16} strokeWidth={1.8} />
          </div>
          <div className="text-xs font-medium text-text-secondary">Gewinn (MTD)</div>
          <div className="mt-1 text-[25px] font-extrabold">{formatEUR(data.profit)}</div>
          <Pill tone={data.marginPct >= 0 ? "green" : "red"} className="mt-2">{data.marginPct}% Marge</Pill>
        </Card>
        <Card>
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#EEF2FF] text-[#4338CA]">
            <Briefcase size={16} strokeWidth={1.8} />
          </div>
          <div className="text-xs font-medium text-text-secondary">Aktive Aufträge</div>
          <div className="mt-1 text-[25px] font-extrabold">{data.activeJobs}</div>
          <div className="mt-2 text-xs text-text-tertiary">über alle Dolmetscher</div>
        </Card>
        <Card>
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#FFFBEB] text-[#B45309]">
            <Inbox size={16} strokeWidth={1.8} />
          </div>
          <div className="text-xs font-medium text-text-secondary">Offene Anfragen</div>
          <div className="mt-1 text-[25px] font-extrabold">{data.openRequests}</div>
          {data.openRequests > 0 && (
            <Pill tone="amber" className="mt-2">wartet auf Zuweisung</Pill>
          )}
        </Card>
      </div>

      <Card className="mb-6" padded={false}>
        <div className="p-5">
          <div className="mb-4 text-[13px] font-bold">Umsatzverlauf — 12 Monate</div>
          <div
            className="flex h-[130px] items-end gap-3.5 px-1"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to top, #EEF0F2 0, #EEF0F2 1px, transparent 1px, transparent 25%)",
            }}
          >
            {data.chart.map((b, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div className="text-[10px] font-bold text-text-secondary">{b.value > 0 ? b.value : ""}</div>
                <div
                  className="w-full rounded-t-[6px] bg-gradient-to-t from-navy to-[#2A3A56]"
                  style={{ height: `${Math.max(4, (b.value / data.chartMax) * 100)}%` }}
                />
                <div className="text-[10px] text-text-tertiary">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-[1.4fr_1fr] gap-5">
        <Card padded={false}>
          <div className="px-5 pb-1 pt-3">
            <div className="mb-1.5 mt-3 text-[13px] font-bold">Letzte Aufträge</div>
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="border-b-[1.5px] border-[#F1F2F4] text-left text-[11px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
                  <th className="py-2 pr-1">Kunde</th>
                  <th className="py-2 pr-1">Dolmetscher</th>
                  <th className="py-2 pr-1">Datum</th>
                  <th className="py-2 pr-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentJobs.map((o) => (
                  <tr key={o.id} className="border-t border-[#F1F2F4] hover:bg-[#FAFAFB]">
                    <td className="py-2.5 pr-1">{o.client}</td>
                    <td className="py-2.5 pr-1">{o.interpreter}</td>
                    <td className="py-2.5 pr-1">{o.date}</td>
                    <td className="py-2.5 pr-1">
                      <Pill tone={o.tone}>{o.label}</Pill>
                    </td>
                  </tr>
                ))}
                {data.recentJobs.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState icon={Briefcase} title="Noch keine Aufträge." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <div className="mb-2.5 text-[13px] font-bold">Warnungen</div>
          {data.alerts.map((text, i) => (
            <div key={i} className="flex items-start gap-2 border-b border-[#F1F2F4] py-2.5 last:border-0">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#DC2626]" />
              <div className="text-[13px]">{text}</div>
            </div>
          ))}
          {data.alerts.length === 0 && (
            <EmptyState icon={ShieldCheck} title="Keine offenen Warnungen." />
          )}
        </Card>
      </div>
    </div>
  );
}

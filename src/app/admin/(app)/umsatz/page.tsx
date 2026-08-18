import Link from "next/link";
import clsx from "clsx";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getRevenueForPeriod, type Period } from "@/lib/queries/revenue";
import { formatEUR } from "@/lib/format";

const PERIODS: { value: Period; label: string }[] = [
  { value: "monat", label: "Monat" },
  { value: "quartal", label: "Quartal" },
  { value: "jahr", label: "Jahr" },
];

export default async function UmsatzPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = "monat" } = await searchParams;
  const active = (["monat", "quartal", "jahr"].includes(period) ? period : "monat") as Period;
  const data = await getRevenueForPeriod(active);

  return (
    <div>
      <div className="mb-5 inline-flex rounded-[10px] border border-field-border bg-white p-[3px]">
        {PERIODS.map((p) => (
          <Link
            key={p.value}
            href={`/admin/umsatz?period=${p.value}`}
            className={clsx(
              "rounded-[8px] px-4 py-2 text-[13px] font-bold transition",
              active === p.value ? "bg-navy text-white" : "text-text-secondary hover:bg-field-bg"
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3.5">
        <StatCard label="Umsatz" value={formatEUR(data.total)} />
        <StatCard label="Rechnungen" value={data.invoiceCount} />
        <StatCard
          label="Ø pro Rechnung"
          value={formatEUR(data.invoiceCount > 0 ? data.total / data.invoiceCount : 0)}
        />
      </div>

      <Card>
        <div className="mb-3 text-[13px] font-bold">Umsatz je Auftraggeber</div>
        <div className="flex flex-col gap-2.5">
          {data.clientRows.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <div className="w-40 truncate text-[12.5px] font-semibold">{c.name}</div>
              <ProgressBar value={c.share} />
              <div className="w-20 text-right text-[12.5px] font-semibold">{formatEUR(c.revenue)}</div>
              <div className="w-10 text-right text-[12.5px] text-text-tertiary">{c.share}%</div>
            </div>
          ))}
          {data.clientRows.length === 0 && (
            <div className="text-[13px] text-text-tertiary">Keine Rechnungen in diesem Zeitraum.</div>
          )}
        </div>
      </Card>
    </div>
  );
}

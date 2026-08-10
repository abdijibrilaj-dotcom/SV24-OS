import Link from "next/link";
import clsx from "clsx";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { getRevenueForPeriod, type Period } from "@/lib/queries/revenue";
import { formatEUR } from "@/lib/format";

const PERIODS: { value: Period; label: string }[] = [
  { value: "monat", label: "Monat" },
  { value: "quartal", label: "Quartal" },
  { value: "jahr", label: "Jahr" },
];

export default async function GewinnPage({
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
            href={`/admin/gewinn?period=${p.value}`}
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
        <Card>
          <div className="text-xs font-medium text-text-secondary">Umsatz</div>
          <div className="mt-1 text-[25px] font-extrabold">{formatEUR(data.total)}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-text-secondary">Dolmetscherkosten</div>
          <div className="mt-1 text-[25px] font-extrabold">{formatEUR(data.interpreterCosts)}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-text-secondary">Gewinn</div>
          <div className="mt-1 text-[25px] font-extrabold">{formatEUR(data.profit)}</div>
          <Pill tone={data.marginPct >= 0 ? "green" : "red"} className="mt-2">
            {data.marginPct}% Marge
          </Pill>
        </Card>
      </div>

      <Card>
        <p className="text-[12.5px] text-text-secondary">
          Gewinn = Umsatz (Rechnungssumme im Zeitraum) abzüglich der im selben Zeitraum hochgeladenen
          Dolmetscher-Auszahlungen. Weitere Kostenarten (Betriebskosten, Personal im Büro etc.) sind hier
          noch nicht erfasst.
        </p>
      </Card>
    </div>
  );
}

import { Card } from "@/components/ui/card";

/**
 * The "label + big number" tile pattern was hand-copied into statistiken/,
 * umsatz/ and gewinn/ with identical markup — any future tweak (spacing,
 * font size) had to be repeated in three places. Centralized here.
 */
export function StatCard({
  label,
  value,
  valueClassName,
  children,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="text-xs font-medium text-text-secondary">{label}</div>
      <div className={`mt-1 text-[25px] font-extrabold ${valueClassName ?? ""}`}>{value}</div>
      {children}
    </Card>
  );
}

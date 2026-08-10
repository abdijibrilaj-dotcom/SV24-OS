import { prisma } from "@/lib/prisma";
import { jobStatusMeta } from "@/lib/status";

const MONTH_LABELS = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfNextMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

export async function getDashboardData() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const nextMonthStart = startOfNextMonth(now);
  const prevMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [
    invoicesThisMonth,
    invoicesPrevMonth,
    payoutsThisMonth,
    activeJobs,
    openDispatch,
    newEmailImports,
    invoicesForChart,
    recentJobs,
    overdueInvoices,
    expiringDocs,
  ] = await Promise.all([
    prisma.invoice.aggregate({
      _sum: { amount: true },
      where: { date: { gte: monthStart, lt: nextMonthStart } },
    }),
    prisma.invoice.aggregate({
      _sum: { amount: true },
      where: { date: { gte: prevMonthStart, lt: monthStart } },
    }),
    prisma.payout.aggregate({
      _sum: { amount: true },
      where: { uploadedAt: { gte: monthStart, lt: nextMonthStart } },
    }),
    prisma.job.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } }),
    prisma.dispatchJob.count({ where: { status: "OFFEN" } }),
    prisma.emailImport.count({ where: { status: "NEU" } }),
    prisma.invoice.findMany({
      where: { date: { gte: twelveMonthsAgo } },
      select: { date: true, amount: true },
    }),
    prisma.job.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { client: true, interpreter: true },
    }),
    prisma.invoice.findMany({
      where: { status: "UEBERFAELLIG" },
      include: { client: true },
      take: 3,
    }),
    prisma.document.findMany({
      where: { status: { in: ["LAEUFT_AB", "FEHLT"] } },
      include: { interpreter: true },
      take: 3,
    }),
  ]);

  const revenue = Number(invoicesThisMonth._sum.amount ?? 0);
  const revenuePrev = Number(invoicesPrevMonth._sum.amount ?? 0);
  const revenueGrowthPct = revenuePrev > 0 ? Math.round(((revenue - revenuePrev) / revenuePrev) * 1000) / 10 : 0;

  const interpreterCosts = Number(payoutsThisMonth._sum.amount ?? 0);
  const profit = revenue - interpreterCosts;
  const marginPct = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;

  const buckets = new Map<string, number>();
  for (let i = 0; i < 12; i++) {
    const d = new Date(twelveMonthsAgo.getFullYear(), twelveMonthsAgo.getMonth() + i, 1);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }
  for (const inv of invoicesForChart) {
    const d = new Date(inv.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + Number(inv.amount));
  }
  const chart = Array.from(buckets.entries()).map(([key, value]) => {
    const month = Number(key.split("-")[1]);
    return { label: MONTH_LABELS[month], value: Math.round(value) };
  });
  const chartMax = Math.max(1, ...chart.map((c) => c.value));

  const alerts: string[] = [];
  for (const inv of overdueInvoices) {
    alerts.push(`Rechnung ${inv.number} an ${inv.client.name} ist überfällig`);
  }
  for (const doc of expiringDocs) {
    alerts.push(
      doc.status === "FEHLT"
        ? `${doc.name} fehlt bei ${doc.interpreter.name}`
        : `${doc.name} von ${doc.interpreter.name} läuft bald ab`
    );
  }
  if (newEmailImports > 0) {
    alerts.push(`${newEmailImports} neue E-Mail-Anfrage${newEmailImports > 1 ? "n" : ""} wartet auf Prüfung`);
  }

  return {
    revenue,
    revenueGrowthPct,
    profit,
    marginPct,
    activeJobs,
    openRequests: openDispatch + newEmailImports,
    chart,
    chartMax,
    recentJobs: recentJobs.map((j) => ({
      id: j.id,
      client: j.client.name,
      interpreter: j.interpreter?.name ?? "— offen —",
      date: new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" }).format(j.date),
      ...jobStatusMeta[j.status],
    })),
    alerts: alerts.slice(0, 4),
  };
}

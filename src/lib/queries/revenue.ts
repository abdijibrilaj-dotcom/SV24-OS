import { prisma } from "@/lib/prisma";

export type Period = "monat" | "quartal" | "jahr";

function periodStart(period: Period, now = new Date()): Date {
  if (period === "monat") return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === "quartal") return new Date(now.getFullYear(), now.getMonth() - 2, 1);
  return new Date(now.getFullYear(), 0, 1);
}

export async function getRevenueForPeriod(period: Period) {
  const now = new Date();
  const start = periodStart(period, now);

  const [invoices, payouts] = await Promise.all([
    prisma.invoice.findMany({
      where: { date: { gte: start } },
      include: { client: true },
    }),
    prisma.payout.aggregate({
      _sum: { amount: true },
      where: { uploadedAt: { gte: start } },
    }),
  ]);

  const total = invoices.reduce((sum, i) => sum + Number(i.amount), 0);
  const interpreterCosts = Number(payouts._sum.amount ?? 0);
  const profit = total - interpreterCosts;
  const marginPct = total > 0 ? Math.round((profit / total) * 1000) / 10 : 0;

  const byClient = new Map<string, number>();
  for (const inv of invoices) {
    byClient.set(inv.client.name, (byClient.get(inv.client.name) ?? 0) + Number(inv.amount));
  }
  const clientRows = Array.from(byClient.entries())
    .map(([name, revenue]) => ({ name, revenue, share: total > 0 ? Math.round((revenue / total) * 100) : 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  return { total, interpreterCosts, profit, marginPct, clientRows, invoiceCount: invoices.length };
}

import { prisma } from "@/lib/prisma";

function startOfToday() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfTomorrow() {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

export async function getBueroHomeData(userId: string) {
  const today = startOfToday();
  const tomorrow = startOfTomorrow();

  const [jobsToday, openInvoices, newRequests, upcoming, notifications] = await Promise.all([
    prisma.job.count({ where: { date: { gte: today, lt: tomorrow } } }),
    prisma.invoice.count({ where: { status: { in: ["OFFEN", "UEBERFAELLIG"] } } }),
    prisma.emailImport.count({ where: { status: "NEU" } }),
    prisma.job.findMany({
      where: { date: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } },
      include: { client: true, interpreter: true },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 5,
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return { jobsToday, openInvoices, newRequests, upcoming, notifications };
}

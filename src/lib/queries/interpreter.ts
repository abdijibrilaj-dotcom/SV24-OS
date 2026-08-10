import { prisma } from "@/lib/prisma";

function startOfWeek(d: Date) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export async function getInterpreterHomeData(interpreterId: string) {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [interpreter, jobsThisWeek, pendingJobs, upcomingConfirmed] = await Promise.all([
    prisma.interpreter.findUniqueOrThrow({ where: { id: interpreterId } }),
    prisma.job.count({
      where: { interpreterId, date: { gte: weekStart, lt: weekEnd } },
    }),
    prisma.job.findMany({
      where: { interpreterId, status: "PENDING" },
      include: { client: true },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    }),
    prisma.job.findMany({
      where: { interpreterId, status: "CONFIRMED", date: { gte: today } },
      include: { client: true },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 5,
    }),
  ]);

  return {
    interpreter,
    jobsThisWeek,
    pendingJobs,
    upcomingConfirmed,
    pendingCount: pendingJobs.length,
  };
}

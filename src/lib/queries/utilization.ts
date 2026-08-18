import { prisma } from "@/lib/prisma";
import { getWeekStart, addDays } from "@/lib/dates";

export type UtilizationRow = {
  interpreterId: string;
  name: string;
  offeredDays: number;
  assignedJobs: number;
  loadPct: number; // 0-100+, can exceed 100 if more jobs than offered days
};

/**
 * Same fairness math used to pick a suggestion in lib/matching.ts, but
 * surfaced for the whole active pool this week so Admin/Büro can see at a
 * glance who's overloaded and who has open capacity — not just per
 * individual dispatch decision.
 */
export async function getWeeklyUtilization(referenceDate: Date = new Date()): Promise<UtilizationRow[]> {
  const weekStart = getWeekStart(referenceDate);
  const weekEnd = addDays(weekStart, 7);

  const interpreters = await prisma.interpreter.findMany({
    where: { status: "AKTIV" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  if (interpreters.length === 0) return [];

  const interpreterIds = interpreters.map((i) => i.id);

  const [unavailableRows, jobs] = await Promise.all([
    prisma.availability.findMany({
      where: { interpreterId: { in: interpreterIds }, date: { gte: weekStart, lt: weekEnd }, available: false },
      select: { interpreterId: true },
    }),
    prisma.job.findMany({
      where: {
        interpreterId: { in: interpreterIds },
        date: { gte: weekStart, lt: weekEnd },
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      },
      select: { interpreterId: true },
    }),
  ]);

  const unavailableCount = new Map<string, number>();
  for (const row of unavailableRows) {
    unavailableCount.set(row.interpreterId, (unavailableCount.get(row.interpreterId) ?? 0) + 1);
  }
  const assignedCount = new Map<string, number>();
  for (const job of jobs) {
    if (!job.interpreterId) continue;
    assignedCount.set(job.interpreterId, (assignedCount.get(job.interpreterId) ?? 0) + 1);
  }

  return interpreters
    .map((i) => {
      const offeredDays = Math.max(1, 7 - (unavailableCount.get(i.id) ?? 0));
      const assignedJobs = assignedCount.get(i.id) ?? 0;
      return {
        interpreterId: i.id,
        name: i.name,
        offeredDays,
        assignedJobs,
        loadPct: Math.round((assignedJobs / offeredDays) * 100),
      };
    })
    .sort((a, b) => b.loadPct - a.loadPct);
}

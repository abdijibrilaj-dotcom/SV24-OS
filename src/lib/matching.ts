import { prisma } from "@/lib/prisma";
import { getWeekStart, addDays, toISODate } from "@/lib/dates";

const LANGUAGE_CODE: Record<string, string> = {
  Deutsch: "DE",
  Türkisch: "TR",
  Arabisch: "AR",
  Ukrainisch: "UK",
  Russisch: "RU",
  Französisch: "FR",
  Serbisch: "SR",
  Kroatisch: "HR",
  Farsi: "FA",
  Persisch: "FA",
  Dari: "DA",
  Somali: "SO",
  Englisch: "EN",
};

export function languageCodeFor(languageName: string): string | null {
  return LANGUAGE_CODE[languageName.trim()] ?? null;
}

/**
 * Explainable matching with a fairness pass: filters active interpreters
 * who speak the requested language and aren't marked unavailable on the
 * requested date, then — among those still in the running — prefers
 * whoever has the most free capacity relative to what they offered this
 * week, using rating only as a tiebreaker. This mirrors how the days
 * offered vs. jobs assigned this week is already tracked in the
 * interpreter calendar (`Availability`), it just wasn't factored into
 * the suggestion before. Every factor stays visible in the returned
 * score so Büro/Admin can sanity-check a suggestion before sending it.
 */
export async function findBestMatch(languageName: string, date: Date) {
  const code = languageCodeFor(languageName);

  const candidates = await prisma.interpreter.findMany({
    where: {
      status: "AKTIV",
      ...(code ? { langs: { has: code } } : {}),
    },
    include: { user: true },
  });

  if (candidates.length === 0) return null;

  const candidateIds = candidates.map((c) => c.id);
  const weekStart = getWeekStart(date);
  const weekEnd = addDays(weekStart, 7);
  const targetIso = toISODate(date);

  const [weekAvailability, weekJobs] = await Promise.all([
    prisma.availability.findMany({
      where: {
        interpreterId: { in: candidateIds },
        date: { gte: weekStart, lt: weekEnd },
        available: false,
      },
      select: { interpreterId: true, date: true },
    }),
    prisma.job.findMany({
      where: {
        interpreterId: { in: candidateIds },
        date: { gte: weekStart, lt: weekEnd },
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      },
      select: { interpreterId: true },
    }),
  ]);

  const unavailableOnDate = new Set(
    weekAvailability.filter((a) => toISODate(a.date) === targetIso).map((a) => a.interpreterId)
  );
  const available = candidates.filter((c) => !unavailableOnDate.has(c.id));
  const pool = available.length > 0 ? available : candidates;

  const unavailableDaysThisWeek = new Map<string, number>();
  for (const row of weekAvailability) {
    unavailableDaysThisWeek.set(row.interpreterId, (unavailableDaysThisWeek.get(row.interpreterId) ?? 0) + 1);
  }
  const assignedThisWeek = new Map<string, number>();
  for (const job of weekJobs) {
    if (!job.interpreterId) continue;
    assignedThisWeek.set(job.interpreterId, (assignedThisWeek.get(job.interpreterId) ?? 0) + 1);
  }

  const scored = pool.map((interpreter) => {
    // Days this week the interpreter hasn't explicitly opted out of
    // (defaults to "offered" for days with no entry, same default the
    // interpreter calendar itself uses).
    const offeredDays = Math.max(1, 7 - (unavailableDaysThisWeek.get(interpreter.id) ?? 0));
    const assigned = assignedThisWeek.get(interpreter.id) ?? 0;
    const loadRatio = Math.min(1, assigned / offeredDays); // 0 = totally free, 1 = fully booked
    return { interpreter, loadRatio };
  });

  // Fairness first — least-loaded relative to what they offered this
  // week gets priority — rating only breaks ties.
  scored.sort(
    (a, b) => a.loadRatio - b.loadRatio || Number(b.interpreter.rating) - Number(a.interpreter.rating)
  );
  const best = scored[0];

  const fairnessBonus = Math.round((1 - best.loadRatio) * 10); // up to +10 for a wide-open interpreter
  const score = Math.max(
    55,
    Math.min(98, Math.round(55 + Number(best.interpreter.rating) * 6 + fairnessBonus))
  );

  return { interpreter: best.interpreter, score };
}

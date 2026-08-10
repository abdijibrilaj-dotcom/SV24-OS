import { prisma } from "@/lib/prisma";

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
 * Simple, explainable matching: filters active interpreters who speak the
 * requested language and aren't marked unavailable on the requested date,
 * then ranks by rating. Not a black box — every factor is visible in the
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

  const unavailable = await prisma.availability.findMany({
    where: {
      date,
      available: false,
      interpreterId: { in: candidates.map((c) => c.id) },
    },
    select: { interpreterId: true },
  });
  const unavailableIds = new Set(unavailable.map((a) => a.interpreterId));

  const available = candidates.filter((c) => !unavailableIds.has(c.id));
  const pool = available.length > 0 ? available : candidates;

  pool.sort((a, b) => Number(b.rating) - Number(a.rating));
  const best = pool[0];

  const score = Math.max(55, Math.min(98, Math.round(58 + Number(best.rating) * 8)));

  return { interpreter: best, score };
}

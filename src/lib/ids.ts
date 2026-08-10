import type { Prisma, PrismaClient } from "@prisma/client";

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Central, transaction-safe allocator for interpreter IDs (format "D-1001",
 * "D-1002", ...). Backed by its own row instead of MAX(humanId)+1 so a
 * deleted interpreter's number is never reissued. Postgres resolves the
 * upsert's ON CONFLICT atomically, so concurrent calls can't collide.
 */
export async function nextInterpreterHumanId(db: Db): Promise<string> {
  const seq = await db.idSequence.upsert({
    where: { key: "interpreter" },
    create: { key: "interpreter", current: 1001 },
    update: { current: { increment: 1 } },
  });
  return `D-${seq.current}`;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

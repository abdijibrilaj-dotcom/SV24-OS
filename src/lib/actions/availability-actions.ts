"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseISODate } from "@/lib/dates";

export async function toggleAvailabilityAction(dateIso: string) {
  const session = await auth();
  const interpreterId = session?.user.interpreterId;
  if (!interpreterId) throw new Error("Keine Berechtigung.");

  const date = parseISODate(dateIso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) throw new Error("Vergangene Tage können nicht geändert werden.");

  const existing = await prisma.availability.findUnique({
    where: { interpreterId_date: { interpreterId, date } },
  });
  const currentlyAvailable = existing?.available ?? true;

  await prisma.availability.upsert({
    where: { interpreterId_date: { interpreterId, date } },
    update: { available: !currentlyAvailable },
    create: { interpreterId, date, available: !currentlyAvailable },
  });

  revalidatePath("/interpreter/kalender");
}

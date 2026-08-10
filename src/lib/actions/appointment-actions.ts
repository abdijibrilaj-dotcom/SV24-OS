"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { parseISODate } from "@/lib/dates";

export async function createAppointmentAction(input: {
  client: string;
  interpreter: string;
  street: string;
  zip: string;
  date: string;
  time: string;
}): Promise<{ ok: true } | { error: string }> {
  const session = await auth();
  if (session?.user.role !== Role.ADMIN && session?.user.role !== Role.BUERO) {
    return { error: "Keine Berechtigung." };
  }

  const clientName = input.client.trim();
  if (!clientName) return { error: "Kunde ist erforderlich." };
  if (!input.date) return { error: "Datum ist erforderlich." };
  if (!input.time) return { error: "Uhrzeit ist erforderlich." };

  const client = await prisma.client.upsert({
    where: { name: clientName },
    update: {},
    create: { name: clientName, contact: "—" },
  });

  let interpreterId: string | null = null;
  const interpreterName = input.interpreter.trim();
  if (interpreterName) {
    const interpreter = await prisma.interpreter.findFirst({
      where: { name: { equals: interpreterName, mode: "insensitive" } },
    });
    interpreterId = interpreter?.id ?? null;
  }

  const location = [input.street.trim(), input.zip.trim()].filter(Boolean).join(", ");

  await prisma.job.create({
    data: {
      clientId: client.id,
      interpreterId,
      langPair: "—",
      type: "Termin",
      date: parseISODate(input.date),
      time: input.time,
      location: location || "—",
      status: "PENDING",
    },
  });

  revalidatePath("/admin/kalender");
  revalidatePath("/admin");
  return { ok: true };
}

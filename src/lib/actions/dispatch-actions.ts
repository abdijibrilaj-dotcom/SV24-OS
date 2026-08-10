"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { notifyUser } from "@/lib/push";
import { formatDateShort } from "@/lib/format";

export async function assignDispatchJobAction(dispatchJobId: string) {
  const session = await auth();
  if (session?.user.role !== Role.ADMIN && session?.user.role !== Role.BUERO) {
    throw new Error("Keine Berechtigung.");
  }

  const dispatchJob = await prisma.dispatchJob.findUniqueOrThrow({
    where: { id: dispatchJobId },
    include: { client: true, interpreter: { include: { user: true } } },
  });
  if (!dispatchJob.interpreterId || !dispatchJob.interpreter) {
    throw new Error("Kein Vorschlag verfügbar — bitte manuell im Kalender anlegen.");
  }

  await prisma.$transaction([
    prisma.job.create({
      data: {
        clientId: dispatchJob.clientId,
        interpreterId: dispatchJob.interpreterId,
        langPair: dispatchJob.langPair,
        type: "Termin",
        date: dispatchJob.date,
        time: dispatchJob.time,
        location: dispatchJob.client.name,
        status: "PENDING",
      },
    }),
    prisma.dispatchJob.update({
      where: { id: dispatchJobId },
      data: { status: "ZUGEWIESEN" },
    }),
  ]);

  if (dispatchJob.interpreter.user) {
    await notifyUser(
      dispatchJob.interpreter.user.id,
      `${dispatchJob.client.name} · ${dispatchJob.langPair}, ${formatDateShort(dispatchJob.date)} ${dispatchJob.time}`,
      { title: "Neuer Auftrag", link: "/interpreter" }
    );
  }

  revalidatePath("/admin/dispatch");
  revalidatePath("/admin/kalender");
  revalidatePath("/admin");
}

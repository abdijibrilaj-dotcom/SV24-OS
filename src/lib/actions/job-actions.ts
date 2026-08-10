"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { notifyUser } from "@/lib/push";

async function notifyOffice(text: string) {
  const staff = await prisma.user.findMany({
    where: { role: { in: [Role.ADMIN, Role.BUERO] } },
    select: { id: true },
  });
  await Promise.all(staff.map((u) => notifyUser(u.id, text)));
}

export async function confirmJobAction(jobId: string) {
  const session = await auth();
  if (!session?.user.interpreterId) throw new Error("Keine Berechtigung.");

  const job = await prisma.job.findUniqueOrThrow({
    where: { id: jobId },
    include: { client: true, interpreter: true, emailImport: true },
  });
  if (job.interpreterId !== session.user.interpreterId) throw new Error("Keine Berechtigung.");

  await prisma.job.update({ where: { id: jobId }, data: { status: "CONFIRMED" } });
  if (job.emailImport) {
    await prisma.emailImport.update({
      where: { id: job.emailImport.id },
      data: { workflowStage: "BESTAETIGT" },
    });
  }

  await notifyOffice(`${job.interpreter?.name} hat den Termin bei ${job.client.name} bestätigt`);

  revalidatePath("/interpreter");
  revalidatePath("/interpreter/jobs");
  revalidatePath("/buero");
  revalidatePath("/admin/email-import");
  revalidatePath("/admin/kalender");
}

export async function declineJobAction(jobId: string) {
  const session = await auth();
  if (!session?.user.interpreterId) throw new Error("Keine Berechtigung.");

  const job = await prisma.job.findUniqueOrThrow({
    where: { id: jobId },
    include: { client: true, interpreter: true, emailImport: true },
  });
  if (job.interpreterId !== session.user.interpreterId) throw new Error("Keine Berechtigung.");

  await prisma.job.update({ where: { id: jobId }, data: { status: "DECLINED" } });
  if (job.emailImport) {
    await prisma.emailImport.update({
      where: { id: job.emailImport.id },
      data: {
        workflowStage: "GESUCHT",
        matchedInterpreterId: null,
        matchScore: null,
        createdJobId: null,
      },
    });
  }

  await notifyOffice(`${job.interpreter?.name} hat den Termin bei ${job.client.name} abgelehnt`);

  revalidatePath("/interpreter");
  revalidatePath("/interpreter/jobs");
  revalidatePath("/buero");
  revalidatePath("/admin/email-import");
  revalidatePath("/admin/dispatch");
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role, ServiceType } from "@prisma/client";
import { nextResidentHumanId } from "@/lib/ids";

function requireStaff(role?: Role) {
  if (role !== Role.ADMIN && role !== Role.BUERO) throw new Error("Keine Berechtigung.");
}

export async function createResidentAction(input: {
  name: string;
  langs: string[];
  clientId?: string;
  contact?: string;
  initialService: ServiceType;
}): Promise<{ humanId: string } | { error: string }> {
  const session = await auth();
  requireStaff(session?.user.role);

  if (!input.name.trim()) return { error: "Name ist erforderlich." };

  const humanId = await prisma.$transaction(async (tx) => {
    const humanId = await nextResidentHumanId(tx);
    await tx.resident.create({
      data: {
        humanId,
        name: input.name.trim(),
        langs: input.langs,
        clientId: input.clientId || undefined,
        contact: input.contact || undefined,
        services: { create: { type: input.initialService } },
      },
    });
    return humanId;
  });

  revalidatePath("/admin/faelle");
  return { humanId };
}

export async function toggleResidentServiceAction(residentId: string, type: ServiceType, enabled: boolean) {
  const session = await auth();
  requireStaff(session?.user.role);

  if (enabled) {
    await prisma.residentService.upsert({
      where: { residentId_type: { residentId, type } },
      create: { residentId, type },
      update: {},
    });
  } else {
    await prisma.residentService.deleteMany({ where: { residentId, type } });
  }

  revalidatePath(`/admin/faelle/${residentId}`);
  revalidatePath("/admin/faelle");
}

export async function addCaseNoteAction(residentId: string, serviceType: ServiceType, text: string) {
  const session = await auth();
  requireStaff(session?.user.role);
  if (!text.trim()) return { error: "Notiz darf nicht leer sein." };

  await prisma.caseNote.create({
    data: {
      residentId,
      serviceType,
      text: text.trim(),
      authorId: session!.user.id,
    },
  });

  revalidatePath(`/admin/faelle/${residentId}`);
}

export async function setResidentStatusAction(residentId: string, status: "AKTIV" | "ABGESCHLOSSEN") {
  const session = await auth();
  requireStaff(session?.user.role);

  await prisma.resident.update({ where: { id: residentId }, data: { status } });

  revalidatePath(`/admin/faelle/${residentId}`);
  revalidatePath("/admin/faelle");
}

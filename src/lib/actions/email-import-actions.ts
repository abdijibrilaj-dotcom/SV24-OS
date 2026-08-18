"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { findBestMatch } from "@/lib/matching";
import { notifyUser } from "@/lib/push";
import { formatDateShort } from "@/lib/format";

function requireStaff(role?: Role) {
  if (role !== Role.ADMIN && role !== Role.BUERO) throw new Error("Keine Berechtigung.");
}

/** isNeu -> Matching-Vorschlag berechnen (isGesucht) */
export async function confirmEmailImportAction(id: string) {
  const session = await auth();
  requireStaff(session?.user.role);

  const item = await prisma.emailImport.findUniqueOrThrow({ where: { id } });
  const match = await findBestMatch(item.language, item.date);

  await prisma.emailImport.update({
    where: { id },
    data: {
      status: "IN_BEARBEITUNG",
      workflowStage: "GESUCHT",
      matchedInterpreterId: match?.interpreter.id,
      matchScore: match?.score,
    },
  });

  revalidatePath("/admin/email-import");
}

/** isNeu -> Ablehnen */
export async function rejectEmailImportAction(id: string) {
  const session = await auth();
  requireStaff(session?.user.role);

  await prisma.emailImport.update({
    where: { id },
    data: { status: "ABGELEHNT", workflowStage: "ABGELEHNT" },
  });

  revalidatePath("/admin/email-import");
}

/** isGesucht -> Anfrage an Dolmetscher(in) senden (isWartet), legt Job an */
export async function sendRequestAction(id: string) {
  const session = await auth();
  requireStaff(session?.user.role);

  const item = await prisma.emailImport.findUniqueOrThrow({
    where: { id },
    include: { matchedInterpreter: { include: { user: true } } },
  });
  if (!item.matchedInterpreterId || !item.matchedInterpreter) {
    throw new Error("Kein Dolmetscher-Vorschlag vorhanden.");
  }

  // "location" (Einsatzort) is the closest thing an email-parsed request has
  // to a Kunde/Auftraggeber name — there's no separate institution field on
  // EmailImport. Normalized here so whitespace differences between two
  // emails for the same authority don't silently create duplicate clients.
  const clientName = item.location.trim().replace(/\s+/g, " ");
  const client = await prisma.client.upsert({
    where: { name: clientName },
    update: {},
    create: { name: clientName, contact: item.contact },
  });

  await prisma.$transaction(async (tx) => {
    const job = await tx.job.create({
      data: {
        clientId: client.id,
        interpreterId: item.matchedInterpreterId,
        langPair: `DE ↔ ${item.language}`,
        type: "Termin",
        date: item.date,
        time: item.time,
        location: item.location,
        status: "PENDING",
      },
    });
    await tx.emailImport.update({
      where: { id },
      data: { workflowStage: "WARTET", createdJobId: job.id },
    });
  });

  if (item.matchedInterpreter.user) {
    await notifyUser(
      item.matchedInterpreter.user.id,
      `${item.location} · ${item.language}, ${formatDateShort(item.date)} ${item.time}`,
      { title: "Neuer Auftrag", link: "/interpreter" }
    );
  }

  revalidatePath("/admin/email-import");
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/storage";

/**
 * README: Dokumenten-Upload ist Selbstauskunft der Dolmetscher:innen —
 * echter Datei-Upload, kein simulierter Sofort-auf-"Aktuell"-Status mehr.
 * Ampel-Status wird serverseitig aus dem Ablaufdatum berechnet.
 */
export async function uploadDocumentAction(documentId: string, formData: FormData) {
  const session = await auth();
  const interpreterId = session?.user.interpreterId;
  if (!interpreterId) throw new Error("Keine Berechtigung.");

  const document = await prisma.document.findUniqueOrThrow({ where: { id: documentId } });
  if (document.interpreterId !== interpreterId) throw new Error("Keine Berechtigung.");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Bitte eine Datei auswählen.");

  const expiresAtRaw = formData.get("expiresAt");
  const expiresAt = typeof expiresAtRaw === "string" && expiresAtRaw ? new Date(expiresAtRaw) : null;

  const relPath = await saveUploadedFile(file, `documents/${interpreterId}`);

  const now = new Date();
  const status = !expiresAt
    ? "AKTUELL"
    : expiresAt < now
      ? "FEHLT"
      : expiresAt.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000
        ? "LAEUFT_AB"
        : "AKTUELL";

  await prisma.document.update({
    where: { id: documentId },
    data: {
      status,
      expiresAt,
      fileUrl: relPath,
      uploadedAt: now,
      uploadedById: session!.user.id,
    },
  });

  revalidatePath("/interpreter/dokumente");
  revalidatePath("/admin/dokumente");
}

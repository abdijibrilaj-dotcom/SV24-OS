"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { Role, Salutation } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { nextInterpreterHumanId, initialsFromName } from "@/lib/ids";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function slugifyEmail(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z\s-]/g, "")
    .trim()
    .split(/\s+/)
    .join(".");
}

async function uniqueEmail(base: string): Promise<string> {
  let email = `${base}@sprachvermittler24.de`;
  let n = 2;
  while (await prisma.user.findUnique({ where: { email } })) {
    email = `${base}${n}@sprachvermittler24.de`;
    n++;
  }
  return email;
}

function generateTempPassword(): string {
  return randomBytes(9).toString("base64url");
}

export async function createInterpreterAction(input: {
  name: string;
  salutation: Salutation;
  langs: string[];
}): Promise<{ humanId: string; email: string; tempPassword: string } | { error: string }> {
  const session = await auth();
  if (session?.user.role !== Role.ADMIN && session?.user.role !== Role.BUERO) {
    return { error: "Keine Berechtigung." };
  }

  const name = input.name.trim();
  if (!name) return { error: "Name ist erforderlich." };
  const langs = input.langs.map((l) => l.trim().toUpperCase()).filter(Boolean);
  if (langs.length === 0) return { error: "Mindestens eine Sprache ist erforderlich." };

  const email = await uniqueEmail(slugifyEmail(name));
  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const humanId = await prisma.$transaction(async (tx) => {
    const humanId = await nextInterpreterHumanId(tx);
    const user = await tx.user.create({
      data: {
        email,
        name,
        role: Role.INTERPRETER,
        passwordHash,
        mustResetPassword: true,
      },
    });
    await tx.interpreter.create({
      data: {
        humanId,
        salutation: input.salutation,
        name,
        initials: initialsFromName(name),
        langs,
        userId: user.id,
      },
    });
    return humanId;
  });

  revalidatePath("/admin/dolmetscher");

  return { humanId, email, tempPassword };
}

/**
 * Erzeugt ein neues temporäres Passwort für einen bestehenden Dolmetscher und
 * setzt mustResetPassword wieder auf true. Das ursprüngliche temp. Passwort
 * wird nach dem Anlegen nirgends gespeichert (nur als bcrypt-Hash) — das ist
 * der einzige Weg, den Zugang wiederherzustellen, falls es verloren ging oder
 * ein Login fehlschlägt.
 */
export async function resetInterpreterPasswordAction(
  interpreterId: string
): Promise<{ email: string; tempPassword: string } | { error: string }> {
  const session = await auth();
  if (session?.user.role !== Role.ADMIN && session?.user.role !== Role.BUERO) {
    return { error: "Keine Berechtigung." };
  }

  const interpreter = await prisma.interpreter.findUnique({
    where: { id: interpreterId },
    include: { user: true },
  });
  if (!interpreter?.user) return { error: "Kein Benutzerkonto zu diesem Dolmetscher gefunden." };

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  await prisma.user.update({
    where: { id: interpreter.user.id },
    data: { passwordHash, mustResetPassword: true, status: "AKTIV" },
  });

  revalidatePath("/admin/dolmetscher");

  return { email: interpreter.user.email, tempPassword };
}

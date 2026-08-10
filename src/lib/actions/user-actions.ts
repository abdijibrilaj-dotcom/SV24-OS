"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function generateTempPassword(): string {
  return randomBytes(9).toString("base64url");
}

export async function inviteUserAction(input: {
  name: string;
  email: string;
  role: "ADMIN" | "BUERO";
}): Promise<{ email: string; tempPassword: string } | { error: string }> {
  const session = await auth();
  if (session?.user.role !== Role.ADMIN) return { error: "Keine Berechtigung." };

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name || !email) return { error: "Name und E-Mail sind erforderlich." };
  if (input.role !== "ADMIN" && input.role !== "BUERO") {
    return { error: "Ungültige Rolle." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Diese E-Mail-Adresse ist bereits vergeben." };

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      role: input.role,
      passwordHash,
      mustResetPassword: true,
      status: "EINGELADEN",
    },
  });

  revalidatePath("/admin/benutzer");
  return { email, tempPassword };
}

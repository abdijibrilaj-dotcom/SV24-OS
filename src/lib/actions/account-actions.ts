"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_PORTAL } from "@/lib/portals";

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const portal = ROLE_PORTAL[session.user.role];

  if (password.length < 8 || password !== confirm) {
    redirect(`/${portal}/passwort-aendern?error=1`);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash, mustResetPassword: false },
  });

  redirect(`/${portal}`);
}

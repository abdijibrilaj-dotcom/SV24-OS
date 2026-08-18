"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
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

  // The DB row is updated, but the *current* session's JWT still carries
  // the old mustResetPassword: true claim (it's only re-evaluated on
  // sign-in, not on every request) — without re-authenticating here the
  // middleware would keep bouncing the user back to this same page in a
  // loop. Signing in again with the new password mints a fresh token.
  try {
    await signIn("credentials", {
      email: session.user.email,
      password,
      portal,
      redirectTo: `/${portal}`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/${portal}/passwort-aendern?error=1`);
    }
    throw error;
  }
}

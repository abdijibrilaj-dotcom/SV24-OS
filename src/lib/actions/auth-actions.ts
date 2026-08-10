"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import type { Portal } from "@/lib/portals";

export async function loginAction(portal: Portal, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      salutation: formData.get("salutation"),
      portal,
      redirectTo: `/${portal}`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/${portal}/login?error=1`);
    }
    throw error;
  }
}

export async function logoutAction(portal: Portal) {
  await signOut({ redirectTo: `/${portal}/login` });
}

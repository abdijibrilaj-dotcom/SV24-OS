"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function markInvoicePaidAction(invoiceId: string) {
  const session = await auth();
  if (session?.user.role !== Role.ADMIN && session?.user.role !== Role.BUERO) {
    throw new Error("Keine Berechtigung.");
  }
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "BEZAHLT" },
  });
  revalidatePath("/admin/rechnungen");
  revalidatePath("/buero/rechnungen");
}

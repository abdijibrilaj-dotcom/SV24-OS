"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function updateIntegrationSettingsAction(formData: FormData) {
  const session = await auth();
  if (session?.user.role !== Role.ADMIN) throw new Error("Keine Berechtigung.");

  const sevdeskConnected = formData.get("sevdeskConnected") === "on";
  const sevdeskOrgName = String(formData.get("sevdeskOrgName") ?? "").trim() || null;
  const emailImportEnabled = formData.get("emailImportEnabled") === "on";
  const emailImportAddress = String(formData.get("emailImportAddress") ?? "").trim() || null;

  await prisma.integrationSettings.upsert({
    where: { id: 1 },
    update: { sevdeskConnected, sevdeskOrgName, emailImportEnabled, emailImportAddress },
    create: { id: 1, sevdeskConnected, sevdeskOrgName, emailImportEnabled, emailImportAddress },
  });

  revalidatePath("/admin/einstellungen");
  revalidatePath("/admin/rechnungen");
}

/**
 * Deliberately just a reference value — see PricingSettings in
 * schema.prisma. Not consumed by invoice/payout calculation yet.
 */
export async function updatePricingSettingsAction(formData: FormData) {
  const session = await auth();
  if (session?.user.role !== Role.ADMIN) throw new Error("Keine Berechtigung.");

  const parseAmount = (raw: FormDataEntryValue | null) => {
    const trimmed = String(raw ?? "").trim().replace(",", ".");
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  const clientRatePerJob = parseAmount(formData.get("clientRatePerJob"));
  const interpreterRatePerJob = parseAmount(formData.get("interpreterRatePerJob"));

  await prisma.pricingSettings.upsert({
    where: { id: 1 },
    update: { clientRatePerJob, interpreterRatePerJob },
    create: { id: 1, clientRatePerJob, interpreterRatePerJob },
  });

  revalidatePath("/admin/einstellungen");
}

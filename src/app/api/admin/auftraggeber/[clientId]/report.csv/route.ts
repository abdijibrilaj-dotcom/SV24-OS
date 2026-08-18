import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { toCsv } from "@/lib/csv";
import { formatDate, formatEUR } from "@/lib/format";

/**
 * Per-client CSV export of all jobs/invoices — the "safe, fast" stand-in
 * for a full self-service Auftraggeber login portal: Admin/Büro download
 * it here and send it on to the Auftraggeber (Land Hessen, LAB
 * Niedersachsen, etc.) themselves, so there's zero new external-facing
 * login surface or cross-client data-exposure risk while still giving
 * them the transparent, verifiable documentation they'd expect for
 * budget planning and invoice-checking.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const session = await auth();
  if (session?.user.role !== Role.ADMIN && session?.user.role !== Role.BUERO) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { clientId } = await params;
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return new NextResponse("Not found", { status: 404 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;
  const dateFilter = from || to ? { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } : undefined;

  const [jobs, invoices] = await Promise.all([
    prisma.job.findMany({
      where: { clientId, ...(dateFilter ? { date: dateFilter } : {}) },
      include: { interpreter: true },
      orderBy: { date: "asc" },
    }),
    prisma.invoice.findMany({
      where: { clientId, ...(dateFilter ? { date: dateFilter } : {}) },
      orderBy: { date: "asc" },
    }),
  ]);

  const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.amount), 0);

  const rows: (string | number)[][] = [
    [`Einsatzbericht — ${client.name}`],
    [`Erstellt am ${formatDate(new Date())}`],
    [],
    ["Zusammenfassung"],
    ["Anzahl Aufträge im Zeitraum", jobs.length],
    ["Anzahl Rechnungen im Zeitraum", invoices.length],
    ["Rechnungssumme im Zeitraum", formatEUR(totalInvoiced, true)],
    [],
    ["Aufträge"],
    ["Datum", "Uhrzeit", "Sprache", "Art", "Dolmetscher", "Ort", "Status"],
    ...jobs.map((j) => [
      formatDate(j.date),
      j.time,
      j.langPair,
      j.type,
      j.interpreter?.name ?? "— offen —",
      j.location,
      j.status,
    ]),
    [],
    ["Rechnungen"],
    ["Rechnungsnr.", "Datum", "Fällig am", "Betrag", "Status"],
    ...invoices.map((i) => [i.number, formatDate(i.date), formatDate(i.dueDate), formatEUR(Number(i.amount), true), i.status]),
  ];

  const csv = toCsv(rows);
  const safeClientName = client.name.replace(/[^a-zA-Z0-9äöüÄÖÜß_-]+/g, "_");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="einsatzbericht_${safeClientName}.csv"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}

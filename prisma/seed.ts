import { PrismaClient, Role, Salutation } from "@prisma/client";
import bcrypt from "bcryptjs";
import { nextInterpreterHumanId, initialsFromName } from "../src/lib/ids";

const prisma = new PrismaClient();

const TEMP_PASSWORD = "SV24-Start!";

function isoDate(offsetDays: number, base = new Date("2026-08-10")): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

async function main() {
  const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 12);

  // ---------------------------------------------------------------------
  // Admin-Zugänge (zwei gleichwertige Admins) + Platzhalter-Büro-Account
  // ---------------------------------------------------------------------
  await prisma.user.upsert({
    where: { email: "info@sprachvermittler24.de" },
    update: {},
    create: {
      email: "info@sprachvermittler24.de",
      name: "Abdi Jibril",
      role: Role.ADMIN,
      passwordHash,
      mustResetPassword: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "natalia.sprachvermittler24@gmx.de" },
    update: {},
    create: {
      email: "natalia.sprachvermittler24@gmx.de",
      name: "Natalia Maciejewska",
      role: Role.ADMIN,
      passwordHash,
      mustResetPassword: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "buero@sprachvermittler24.de" },
    update: {},
    create: {
      email: "buero@sprachvermittler24.de",
      name: "Büro Team",
      role: Role.BUERO,
      passwordHash,
      mustResetPassword: true,
    },
  });

  await prisma.integrationSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, sevdeskConnected: false, emailImportEnabled: false },
  });

  // ---------------------------------------------------------------------
  // Dolmetscher (mit fortlaufender D-xxxx ID + eigenem Login)
  // ---------------------------------------------------------------------
  const interpreterSeed: {
    name: string;
    salutation: Salutation;
    langs: string[];
    status: "AKTIV" | "URLAUB" | "INAKTIV";
    rating: number;
    payoutTotal: number;
    email: string;
  }[] = [
    { name: "Elif Yildiz", salutation: "FRAU", langs: ["DE", "TR"], status: "AKTIV", rating: 4.9, payoutTotal: 2140, email: "elif.yildiz@sprachvermittler24.de" },
    { name: "Karim Haddad", salutation: "HERR", langs: ["DE", "AR"], status: "AKTIV", rating: 4.7, payoutTotal: 1875, email: "karim.haddad@sprachvermittler24.de" },
    { name: "Olena Kovalenko", salutation: "FRAU", langs: ["DE", "UK", "RU"], status: "AKTIV", rating: 4.8, payoutTotal: 2310, email: "olena.kovalenko@sprachvermittler24.de" },
    { name: "Deniz Aksoy", salutation: "HERR", langs: ["DE", "TR", "EN"], status: "URLAUB", rating: 4.6, payoutTotal: 1420, email: "deniz.aksoy@sprachvermittler24.de" },
    { name: "Amara Diallo", salutation: "FRAU", langs: ["DE", "FR"], status: "AKTIV", rating: 4.9, payoutTotal: 1960, email: "amara.diallo@sprachvermittler24.de" },
    { name: "Milan Petrović", salutation: "HERR", langs: ["DE", "SR", "HR"], status: "AKTIV", rating: 4.5, payoutTotal: 1610, email: "milan.petrovic@sprachvermittler24.de" },
    { name: "Fatima Rahimi", salutation: "FRAU", langs: ["DE", "FA", "DA"], status: "INAKTIV", rating: 4.3, payoutTotal: 640, email: "fatima.rahimi@sprachvermittler24.de" },
  ];

  const interpreters = [];
  for (const seed of interpreterSeed) {
    const existingUser = await prisma.user.findUnique({ where: { email: seed.email } });
    if (existingUser) {
      const existing = await prisma.interpreter.findUnique({ where: { userId: existingUser.id } });
      if (existing) {
        interpreters.push(existing);
        continue;
      }
    }

    const interpreter = await prisma.$transaction(async (tx) => {
      const humanId = await nextInterpreterHumanId(tx);
      const user = await tx.user.create({
        data: {
          email: seed.email,
          name: seed.name,
          role: Role.INTERPRETER,
          passwordHash,
          mustResetPassword: true,
        },
      });
      return tx.interpreter.create({
        data: {
          humanId,
          salutation: seed.salutation,
          name: seed.name,
          initials: initialsFromName(seed.name),
          langs: seed.langs,
          status: seed.status,
          rating: seed.rating,
          payoutTotal: seed.payoutTotal,
          userId: user.id,
        },
      });
    });
    interpreters.push(interpreter);
  }

  // Verfügbarkeit für die nächsten 14 Tage (Standard: verfügbar)
  for (const interpreter of interpreters) {
    for (let i = -2; i < 14; i += 5) {
      await prisma.availability.upsert({
        where: { interpreterId_date: { interpreterId: interpreter.id, date: isoDate(i) } },
        update: {},
        create: { interpreterId: interpreter.id, date: isoDate(i), available: false },
      });
    }
  }

  // Dokumente je Dolmetscher (Ampel-Status)
  const docTemplates = [
    { name: "Ausweisdokument", status: "AKTUELL" as const, expires: 200 },
    { name: "Dolmetscher-Zertifikat", status: "LAEUFT_AB" as const, expires: 18 },
    { name: "Führungszeugnis", status: "FEHLT" as const, expires: null },
  ];
  for (const interpreter of interpreters) {
    for (const doc of docTemplates) {
      await prisma.document.create({
        data: {
          interpreterId: interpreter.id,
          name: doc.name,
          status: doc.status,
          expiresAt: doc.expires ? isoDate(doc.expires) : null,
        },
      });
    }
  }

  // Auszahlungen (nur Admin/Büro dürfen hochladen). Hochladedatum liegt
  // bewusst im jeweiligen Auszahlungsmonat, damit Umsatz/Gewinn (MTD) auf
  // dem Dashboard konsistent zueinander bleiben.
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: "info@sprachvermittler24.de" } });
  const payoutPeriods = [
    { period: "Juni 2026", offset: -50, baseAmount: 380 },
    { period: "Juli 2026", offset: -18, baseAmount: 520 },
    { period: "August 2026", offset: -3, baseAmount: 480 },
  ];
  for (const interpreter of interpreters.slice(0, 5)) {
    for (const { period, offset, baseAmount } of payoutPeriods) {
      await prisma.payout.create({
        data: {
          interpreterId: interpreter.id,
          period,
          amount: baseAmount + Number(interpreter.payoutTotal) * 0.03,
          filename: `gutschrift-${interpreter.humanId.toLowerCase()}-${period.replace(" ", "-").toLowerCase()}.pdf`,
          uploadedById: admin.id,
          uploadedAt: isoDate(offset),
        },
      });
    }
  }

  // ---------------------------------------------------------------------
  // Auftraggeber (Clients)
  // ---------------------------------------------------------------------
  const clientSeed = [
    { name: "Stadtgericht München", contact: "Dr. Weber", status: "AKTIV" as const },
    { name: "Klinikum Nord", contact: "S. Lindemann", status: "AKTIV" as const },
    { name: "Jobcenter Berlin-Mitte", contact: "R. Kaya", status: "AKTIV" as const },
    { name: "Ausländerbehörde Hamburg", contact: "M. Groth", status: "AKTIV" as const },
    { name: "Medical Point Frankfurt", contact: "F. Neumann", status: "AKTIV" as const },
    { name: "Amtsgericht Köln", contact: "T. Brandt", status: "INAKTIV" as const },
  ];
  const clients = [];
  for (const c of clientSeed) {
    clients.push(
      await prisma.client.upsert({
        where: { name: c.name },
        update: {},
        create: c,
      })
    );
  }

  // ---------------------------------------------------------------------
  // Rechnungen
  // ---------------------------------------------------------------------
  const invoiceSeed = [
    { number: "RE-2026-014", client: clients[0], amount: 1240, date: -20, due: -5, status: "UEBERFAELLIG" as const },
    { number: "RE-2026-015", client: clients[1], amount: 860, date: -12, due: 3, status: "OFFEN" as const },
    { number: "RE-2026-016", client: clients[2], amount: 2150, date: -8, due: 7, status: "OFFEN" as const },
    { number: "RE-2026-017", client: clients[3], amount: 540, date: -30, due: -15, status: "BEZAHLT" as const },
    { number: "RE-2026-018", client: clients[4], amount: 1780, date: -4, due: 11, status: "OFFEN" as const },
    { number: "RE-2026-019", client: clients[0], amount: 960, date: -45, due: -30, status: "BEZAHLT" as const },
  ];
  for (const inv of invoiceSeed) {
    await prisma.invoice.upsert({
      where: { number: inv.number },
      update: {},
      create: {
        number: inv.number,
        clientId: inv.client.id,
        amount: inv.amount,
        date: isoDate(inv.date),
        dueDate: isoDate(inv.due),
        status: inv.status,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Jobs (Kalender / Dolmetscher-App) + Dispatch
  // ---------------------------------------------------------------------
  const jobSeed = [
    { client: clients[0], interpreter: interpreters[0], langPair: "DE ↔ TR", type: "Gerichtstermin", offset: 0, time: "09:30", location: "Nymphenburger Str. 16, München", status: "CONFIRMED" as const },
    { client: clients[1], interpreter: interpreters[2], langPair: "DE ↔ UK", type: "Arzttermin", offset: 0, time: "14:00", location: "Klinikum Nord, Haus 3", status: "PENDING" as const },
    { client: clients[2], interpreter: interpreters[1], langPair: "DE ↔ AR", type: "Behördentermin", offset: 1, time: "10:15", location: "Jobcenter Berlin-Mitte", status: "PENDING" as const },
    { client: clients[4], interpreter: interpreters[0], langPair: "DE ↔ TR", type: "Arzttermin", offset: 2, time: "08:45", location: "Medical Point Frankfurt", status: "CONFIRMED" as const },
    { client: clients[3], interpreter: interpreters[4], langPair: "DE ↔ FR", type: "Behördentermin", offset: -1, time: "11:00", location: "Ausländerbehörde Hamburg", status: "COMPLETED" as const },
    { client: clients[1], interpreter: interpreters[2], langPair: "DE ↔ RU", type: "Arzttermin", offset: 3, time: "13:15", location: "Klinikum Nord, Haus 1", status: "PENDING" as const },
  ];
  for (const j of jobSeed) {
    await prisma.job.create({
      data: {
        clientId: j.client.id,
        interpreterId: j.interpreter.id,
        langPair: j.langPair,
        type: j.type,
        date: isoDate(j.offset),
        time: j.time,
        location: j.location,
        status: j.status,
      },
    });
  }

  await prisma.dispatchJob.createMany({
    data: [
      { clientId: clients[2].id, interpreterId: interpreters[5].id, suggestedName: interpreters[5].name, langPair: "DE ↔ SO", date: isoDate(4), time: "09:00", matchScore: 92 },
      { clientId: clients[4].id, interpreterId: interpreters[6].id, suggestedName: interpreters[6].name, langPair: "DE ↔ FA", date: isoDate(5), time: "15:30", matchScore: 78 },
      { clientId: clients[0].id, interpreterId: interpreters[0].id, suggestedName: interpreters[0].name, langPair: "DE ↔ TR", date: isoDate(6), time: "10:00", matchScore: 95 },
    ],
  });

  // ---------------------------------------------------------------------
  // E-Mail-Import Workflow (alle Stufen als Demo)
  // ---------------------------------------------------------------------
  await prisma.emailImport.createMany({
    data: [
      {
        residentName: "Herr Musa Kone",
        regNr: "AZ-88213",
        source: "Postfach: anfragen@sprachvermittler24.de",
        contact: "F. Neumann",
        date: isoDate(6),
        time: "09:00",
        language: "Französisch",
        location: "Medical Point Frankfurt",
        note: "Automatisch aus E-Mail erkannt — bitte Angaben prüfen.",
        status: "NEU",
        workflowStage: "GESUCHT",
      },
      {
        residentName: "Frau Nadia Osei",
        regNr: "AZ-88220",
        source: "Postfach: anfragen@sprachvermittler24.de",
        contact: "R. Kaya",
        date: isoDate(3),
        time: "11:30",
        language: "Somali",
        location: "Jobcenter Berlin-Mitte",
        status: "IN_BEARBEITUNG",
        workflowStage: "GESUCHT",
        matchedInterpreterId: interpreters[5].id,
        matchScore: 92,
      },
      {
        residentName: "Herr Ali Rezai",
        regNr: "AZ-88231",
        source: "Postfach: anfragen@sprachvermittler24.de",
        contact: "M. Groth",
        date: isoDate(5),
        time: "15:30",
        language: "Farsi",
        location: "Ausländerbehörde Hamburg",
        status: "IN_BEARBEITUNG",
        workflowStage: "WARTET",
        matchedInterpreterId: interpreters[6].id,
        matchScore: 78,
      },
      {
        residentName: "Frau Yeva Bondar",
        regNr: "AZ-88198",
        source: "Postfach: anfragen@sprachvermittler24.de",
        contact: "S. Lindemann",
        date: isoDate(2),
        time: "08:30",
        language: "Ukrainisch",
        location: "Klinikum Nord",
        status: "IN_BEARBEITUNG",
        workflowStage: "BESTAETIGT",
        matchedInterpreterId: interpreters[2].id,
        matchScore: 96,
      },
      {
        residentName: "Herr Petar Novak",
        regNr: "AZ-88176",
        source: "Postfach: anfragen@sprachvermittler24.de",
        contact: "T. Brandt",
        date: isoDate(-1),
        time: "10:00",
        language: "Kroatisch",
        location: "Amtsgericht Köln",
        status: "ABGELEHNT",
        workflowStage: "ABGELEHNT",
      },
    ],
  });

  // ---------------------------------------------------------------------
  // Benachrichtigungen
  // ---------------------------------------------------------------------
  const buero = await prisma.user.findUniqueOrThrow({ where: { email: "buero@sprachvermittler24.de" } });
  await prisma.notification.createMany({
    data: [
      { userId: buero.id, text: "Neue Rechnung RE-2026-018 erstellt", unread: true },
      { userId: buero.id, text: "Dolmetscherin Elif Yildiz hat Termin bestätigt", unread: true },
      { userId: buero.id, text: "Zahlung für RE-2026-017 eingegangen", unread: false },
    ],
  });

  const elifUser = await prisma.user.findUniqueOrThrow({ where: { email: "elif.yildiz@sprachvermittler24.de" } });
  await prisma.notification.createMany({
    data: [
      { userId: elifUser.id, text: "Neuer Auftrag: Stadtgericht München · Gerichtstermin, 09:30", unread: true },
      { userId: elifUser.id, text: "Neue Gutschrift für Juli 2026 verfügbar", unread: false },
    ],
  });

  console.log("Seed abgeschlossen.");
  console.log(`Temporäres Passwort für alle Seed-Accounts: ${TEMP_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

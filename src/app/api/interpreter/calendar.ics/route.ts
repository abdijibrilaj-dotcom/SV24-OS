import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { addDays } from "@/lib/dates";
import { buildIcsCalendar, type IcsEvent } from "@/lib/ics";

const JOB_DURATION_MINUTES = 60;

function parseJobStart(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setHours(hours || 0, minutes || 0, 0, 0);
  return start;
}

/**
 * Personal calendar feed for an interpreter's own jobs — .ics is a
 * standard format every phone/desktop calendar app can import or
 * subscribe to, so a job lands directly on their own calendar instead of
 * only living inside the SV24 app.
 */
export async function GET() {
  const session = await auth();
  if (session?.user.role !== Role.INTERPRETER || !session.user.interpreterId) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const interpreter = await prisma.interpreter.findUnique({
    where: { id: session.user.interpreterId },
    select: { name: true },
  });

  const jobs = await prisma.job.findMany({
    where: {
      interpreterId: session.user.interpreterId,
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      date: { gte: addDays(new Date(), -30), lt: addDays(new Date(), 180) },
    },
    include: { client: true },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  const events: IcsEvent[] = jobs.map((job) => {
    const start = parseJobStart(job.date, job.time);
    return {
      uid: job.id,
      summary: `${job.client.name} · ${job.langPair}`,
      start,
      end: new Date(start.getTime() + JOB_DURATION_MINUTES * 60_000),
      location: job.location,
      description: `${job.type} · Status: ${job.status}`,
    };
  });

  const ics = buildIcsCalendar(`SV24 – ${interpreter?.name ?? "Dolmetscher"}`, events);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="sv24-kalender.ics"',
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}

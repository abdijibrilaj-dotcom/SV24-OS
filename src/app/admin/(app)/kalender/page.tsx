import Link from "next/link";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, CalendarX2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { EmptyState } from "@/components/ui/empty-state";
import { jobStatusMeta } from "@/lib/status";
import { NewAppointmentModal } from "@/components/admin/new-appointment-modal";
import {
  getWeekStart,
  addDays,
  toISODate,
  parseISODate,
  weekdayLabel,
  isSameDay,
  formatWeekRange,
  formatDayLabel,
} from "@/lib/dates";

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; day?: string }>;
}) {
  const { week, day } = await searchParams;
  const today = new Date();
  const weekStart = week ? getWeekStart(parseISODate(week)) : getWeekStart(today);
  const isCurrentWeek = isSameDay(weekStart, getWeekStart(today));
  const selectedDay = day ? parseISODate(day) : isCurrentWeek ? today : weekStart;

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = addDays(weekStart, 7);

  const weekJobs = await prisma.job.findMany({
    where: { date: { gte: weekStart, lt: weekEnd } },
    include: { client: true, interpreter: true },
    orderBy: { time: "asc" },
  });

  const countsByDay = new Map<string, number>();
  for (const j of weekJobs) countsByDay.set(toISODate(j.date), (countsByDay.get(toISODate(j.date)) ?? 0) + 1);

  const selectedIso = toISODate(selectedDay);
  const jobsForSelectedDay = weekJobs.filter((j) => toISODate(j.date) === selectedIso);

  const prevWeekIso = toISODate(addDays(weekStart, -7));
  const nextWeekIso = toISODate(addDays(weekStart, 7));

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={`/admin/kalender?week=${prevWeekIso}`}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-field-border bg-white"
        >
          <ChevronLeft size={16} />
        </Link>
        <Link
          href={`/admin/kalender?week=${nextWeekIso}`}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-field-border bg-white"
        >
          <ChevronRight size={16} />
        </Link>
        <div className="text-[14.5px] font-bold">{formatWeekRange(weekStart)}</div>
        {!isCurrentWeek && (
          <Link href="/admin/kalender" className="text-[12.5px] font-semibold text-[#334155]">
            Heute
          </Link>
        )}
        <div className="flex-1" />
        <NewAppointmentModal defaultDate={selectedIso} />
      </div>

      <div className="mb-5 flex gap-2">
        {days.map((d) => {
          const iso = toISODate(d);
          const active = iso === selectedIso;
          const count = countsByDay.get(iso) ?? 0;
          return (
            <Link
              key={iso}
              href={`/admin/kalender?week=${toISODate(weekStart)}&day=${iso}`}
              className={clsx(
                "flex-1 rounded-[14px] border px-2 py-2.5 text-center transition",
                active ? "border-navy bg-navy text-white" : "border-field-border bg-white text-text-primary hover:bg-field-bg"
              )}
            >
              <div className={clsx("text-[11px]", active ? "opacity-70" : "text-text-tertiary")}>{weekdayLabel(d)}</div>
              <div className="text-lg font-bold">{d.getDate()}</div>
              <div className={clsx("mt-0.5 text-[10px]", active ? "opacity-80" : "text-text-tertiary")}>
                {count} Termine
              </div>
            </Link>
          );
        })}
      </div>

      <Card padded={false}>
        <div className="px-5 pb-1 pt-2">
          <div className="mb-1.5 mt-3 text-[13px] font-bold">{formatDayLabel(selectedDay)}</div>
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b-[1.5px] border-[#F1F2F4] text-left text-[11px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
                <th className="px-1 py-2">Kunde</th>
                <th className="px-1 py-2">Dolmetscher</th>
                <th className="px-1 py-2">Uhrzeit</th>
                <th className="px-1 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {jobsForSelectedDay.map((j) => {
                const meta = jobStatusMeta[j.status];
                return (
                  <tr key={j.id} className="border-t border-[#F1F2F4] hover:bg-[#FAFAFB]">
                    <td className="px-1 py-2.5">{j.client.name}</td>
                    <td className="px-1 py-2.5">{j.interpreter?.name ?? "— offen —"}</td>
                    <td className="px-1 py-2.5">{j.time}</td>
                    <td className="px-1 py-2.5">
                      <Pill tone={meta.tone}>{meta.label}</Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {jobsForSelectedDay.length === 0 && (
            <EmptyState icon={CalendarX2} title="Keine Termine an diesem Tag." />
          )}
        </div>
      </Card>
    </div>
  );
}

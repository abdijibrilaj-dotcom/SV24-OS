import clsx from "clsx";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { InterpreterTabBar } from "@/components/interpreter/interpreter-tab-bar";
import { addDays, toISODate, weekdayLabel } from "@/lib/dates";
import { toggleAvailabilityAction } from "@/lib/actions/availability-actions";
import { getUnreadCount } from "@/lib/queries/notifications";

export default async function InterpreterKalenderPage() {
  const session = await auth();
  const interpreterId = session!.user.interpreterId!;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  const [rows, unreadCount] = await Promise.all([
    prisma.availability.findMany({
      where: { interpreterId, date: { gte: days[0], lte: days[days.length - 1] } },
    }),
    getUnreadCount(session!.user.id),
  ]);
  const availabilityMap = new Map(rows.map((r) => [toISODate(r.date), r.available]));

  return (
    <MobileScreen
      header={{ mode: "brand", notifHref: "/interpreter/benachrichtigungen", unreadCount }}
      tabBar={<InterpreterTabBar />}
    >
      <div className="mb-4 text-[18px] font-extrabold">Verfügbarkeit</div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const iso = toISODate(d);
          const available = availabilityMap.get(iso) ?? true;
          return (
            <form key={iso} action={toggleAvailabilityAction.bind(null, iso)}>
              <button
                type="submit"
                className={clsx(
                  "flex w-full flex-col items-center gap-0.5 rounded-[12px] border py-2.5 text-center transition",
                  available
                    ? "border-field-border bg-white text-text-primary"
                    : "border-navy bg-navy text-white"
                )}
              >
                <span className="text-[10px] opacity-70">{weekdayLabel(d)}</span>
                <span className="text-[14px] font-bold">{d.getDate()}</span>
              </button>
            </form>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] border border-field-border bg-white" />
          Verfügbar
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] bg-navy" />
          Nicht verfügbar
        </div>
      </div>
    </MobileScreen>
  );
}

import Link from "next/link";
import { ChevronLeft, Bell } from "lucide-react";
import clsx from "clsx";

type HeaderMode =
  | { mode: "brand"; notifHref: string; unreadCount: number }
  | { mode: "brand"; action: React.ReactNode }
  | { mode: "back"; title: string; backHref: string }
  | { mode: "none" };

export function MobileScreen({
  header,
  tabBar,
  children,
  padded = true,
}: {
  header: HeaderMode;
  tabBar?: React.ReactNode;
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <div className="flex h-screen flex-col bg-content-bg-mobile">
      {header.mode === "brand" && (
        <div className="flex flex-shrink-0 items-center gap-2.5 bg-white px-4 pb-3 pt-[max(14px,env(safe-area-inset-top))]">
          <div className="text-lg font-extrabold">
            SV24 <span className="font-semibold text-text-secondary">OS</span>
          </div>
          <div className="flex-1" />
          {"action" in header ? (
            header.action
          ) : (
            <Link
              href={header.notifHref}
              className="relative flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-field-border bg-field-bg text-text-primary"
            >
              <Bell size={17} strokeWidth={1.8} />
              {header.unreadCount > 0 && (
                <span className="absolute right-[5px] top-[5px] h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-[#DC2626]" />
              )}
            </Link>
          )}
        </div>
      )}
      {header.mode === "back" && (
        <div className="flex flex-shrink-0 items-center gap-2.5 bg-white px-4 pb-3 pt-[max(14px,env(safe-area-inset-top))]">
          <Link
            href={header.backHref}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-field-border bg-field-bg text-text-primary"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </Link>
          <div className="text-lg font-bold">{header.title}</div>
        </div>
      )}

      <div className={clsx("flex-1 overflow-y-auto", padded && "px-4 py-3.5", tabBar && "pb-4")}>{children}</div>

      {tabBar}
    </div>
  );
}

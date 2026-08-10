"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ADMIN_NAV } from "@/components/admin/nav-config";
import { SidebarWordmark } from "@/components/logo";

const GREETINGS: { text: string; left: string; delay: string; duration: string; opacity: number }[] = [
  { text: "こんにちは", left: "6%", delay: "0s", duration: "5s", opacity: 0.8 },
  { text: "Merhaba", left: "28%", delay: ".9s", duration: "4.2s", opacity: 0.65 },
  { text: "مرحباً", left: "46%", delay: "1.8s", duration: "5.6s", opacity: 0.75 },
  { text: "Salaan", left: "60%", delay: ".45s", duration: "4.6s", opacity: 0.7 },
  { text: "Привет", left: "12%", delay: "2.4s", duration: "3.8s", opacity: 0.55 },
  { text: "سلام", left: "78%", delay: "1.2s", duration: "5.2s", opacity: 0.7 },
  { text: "Bonjour", left: "90%", delay: "3s", duration: "4.4s", opacity: 0.6 },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminSidebar({
  userName,
  userRoleLabel,
  initials,
}: {
  userName: string;
  userRoleLabel: string;
  initials: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="relative z-[1] flex h-screen w-64 flex-shrink-0 flex-col gap-[22px] overflow-y-auto bg-navy p-4 py-6 shadow-[6px_0_24px_-12px_rgba(16,24,40,.25)]">
      <div className="flex items-center gap-2.5 px-1.5">
        <SidebarWordmark className="text-[17px] text-white" />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {ADMIN_NAV.map((group) => (
          <div key={group.title}>
            <div className="px-3 pb-1 pt-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#52627A]">
              {group.title}
            </div>
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13.5px] font-semibold transition",
                    active
                      ? "bg-white/10 text-white"
                      : "text-[#B7C0CE] hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3.5">
        <div className="relative h-[78px] overflow-hidden">
          {GREETINGS.map((g) => (
            <div
              key={g.text}
              className="animate-bubble absolute bottom-0 whitespace-nowrap font-semibold text-white"
              style={{
                left: g.left,
                fontSize: 11,
                opacity: g.opacity,
                animationDelay: g.delay,
                animationDuration: g.duration,
              }}
            >
              {g.text}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-navy-border bg-navy-soft p-2.5">
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-[#334155] text-xs font-bold text-white shadow-[0_0_0_2px_#1C2B45,0_0_0_3px_#34456A]">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-white">{userName}</div>
            <div className="text-[11px] text-[#8B99AC]">{userRoleLabel}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";
import { sectionTitleForPath } from "@/components/admin/nav-config";

export function AdminHeader({ unreadCount }: { unreadCount: number }) {
  const title = sectionTitleForPath(usePathname());
  return (
    <div className="flex items-center gap-4 border-b border-[#E2E6EA] bg-content-bg px-8 py-5">
      <div className="text-[24px] font-extrabold tracking-tight">{title}</div>
      <div className="flex-1" />
      <div className="relative">
        <Search
          size={15}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          placeholder="Suchen…"
          className="w-[230px] rounded-[10px] border border-field-border bg-field-bg py-2.5 pl-9 pr-3.5 text-[13px] outline-none transition focus:border-[#93C5FD] focus:bg-white focus:ring-4 focus:ring-[#DBEAFE]"
        />
      </div>
      <button
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-field-border bg-field-bg text-text-primary transition hover:bg-[#EEF0F2]"
      >
        <Bell size={17} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border-[1.5px] border-white bg-[#DC2626]" />
        )}
      </button>
      <form action={logoutAction.bind(null, "admin")}>
        <button
          type="submit"
          title="Abmelden"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-field-border bg-field-bg text-text-primary transition hover:bg-[#EEF0F2]"
        >
          <LogOut size={16} strokeWidth={1.8} />
        </button>
      </form>
    </div>
  );
}

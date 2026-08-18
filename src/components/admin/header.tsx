"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";
import { sectionTitleForPath } from "@/components/admin/nav-config";
import { Pill } from "@/components/ui/pill";

export function AdminHeader({ unreadCount }: { unreadCount: number }) {
  const title = sectionTitleForPath(usePathname());
  return (
    <div className="flex items-center gap-4 border-b border-[#E2E6EA] bg-content-bg px-8 py-5">
      <div className="text-[24px] font-extrabold tracking-tight">{title}</div>
      <div className="flex-1" />
      {unreadCount > 0 && <Pill tone="amber">{unreadCount} neue Benachrichtigung{unreadCount === 1 ? "" : "en"}</Pill>}
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

export type TabItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function TabBar({ items }: { items: TabItem[] }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-shrink-0 border-t border-card-border-mobile bg-white px-2 pb-[max(20px,env(safe-area-inset-bottom))] pt-2">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition",
              active ? "text-navy" : "text-text-tertiary"
            )}
          >
            <Icon size={21} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

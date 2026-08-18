import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

/**
 * Every "no data yet" message in the app used to be a single line of
 * text-tertiary — correct, but sparse, especially the first time someone
 * opens the app with an empty database. This adds a small icon and
 * (optionally) a call-to-action without changing the underlying logic.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-field-bg-alt text-text-tertiary">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div className="text-[13px] text-text-secondary">{title}</div>
      {action}
    </div>
  );
}

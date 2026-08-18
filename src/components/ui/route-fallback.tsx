import { AlertTriangle, SearchX } from "lucide-react";

/**
 * Shared visual for error.tsx / not-found.tsx across all three portals, so
 * an unexpected error or a bad link shows a branded, understandable German
 * message instead of Next.js's default unstyled error page.
 */
export function RouteFallback({
  icon = "error",
  title,
  description,
  action,
}: {
  icon?: "error" | "not-found";
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const Icon = icon === "error" ? AlertTriangle : SearchX;
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-field-bg-alt text-text-secondary">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <div className="text-lg font-extrabold text-text-primary">{title}</div>
      <p className="max-w-[42ch] text-[13.5px] text-text-secondary">{description}</p>
      {action}
    </div>
  );
}

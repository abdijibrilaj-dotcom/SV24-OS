import clsx from "clsx";

/** Real Sprachvermittler24 brand lockup (monogram + wordmark + tagline). */
export function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Sprachvermittler24"
      className={clsx("h-auto w-32", className)}
    />
  );
}

/** Compact "SV24 OS" text wordmark used in the admin sidebar / mobile headers. */
export function SidebarWordmark({ className }: { className?: string }) {
  return (
    <div className={clsx("font-extrabold tracking-tight", className)}>
      SV24<span className="font-medium opacity-80"> OS</span>
    </div>
  );
}

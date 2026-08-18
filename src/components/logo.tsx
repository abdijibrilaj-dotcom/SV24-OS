import clsx from "clsx";

/**
 * Real Sprachvermittler24 brand lockup (monogram + wordmark + tagline).
 *
 * Note: `className` fully replaces the default sizing rather than merging
 * with it. Plain clsx() concatenation of "h-auto w-32" with a caller's own
 * size classes (e.g. "h-16 w-auto") puts two conflicting height/width
 * utilities in the same class list — which one wins then depends on
 * Tailwind's generated CSS order, not on source order, so the logo can
 * render at an unpredictable (and sometimes huge) size. Every call site
 * already passes its own sizing, so a full override is both simpler and
 * deterministic.
 */
export function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="Sprachvermittler24" className={className ?? "h-auto w-32"} />
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

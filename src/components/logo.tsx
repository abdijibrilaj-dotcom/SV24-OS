import clsx from "clsx";

/**
 * Vector recreation of the Sprachvermittler24 wordmark (monogram "SV" +
 * "24" + tagline). The original artwork was supplied as a pasted chat
 * image, which this sandbox cannot read as a file — this is a faithful
 * from-scratch redraw matching the colors/shapes seen in the reference
 * screenshot. Swap the <svg> markup below for the real asset (e.g. an
 * <img src="/logo.svg">) once it's uploaded as a file.
 */

const INK = "#3B0E23"; // bordeaux/aubergine monogram + wordmark ink
const COPPER = "#B9805A"; // "24" + tagline accent

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M45 30c-13 0-22 8-22 19 0 24 40 15 40 32 0 8-8 13-18 13-9 0-16-4-20-11"
        stroke={INK}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M50 32l22 58 26-60"
        stroke={INK}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <text
        x="82"
        y="70"
        fontFamily="var(--font-manrope), sans-serif"
        fontWeight={800}
        fontSize="30"
        fill={COPPER}
      >
        24
      </text>
    </svg>
  );
}

export function Logo({
  className,
  withTagline = true,
}: {
  className?: string;
  withTagline?: boolean;
}) {
  return (
    <div className={clsx("flex flex-col items-center gap-2", className)}>
      <LogoMark className="h-16 w-16" />
      <div
        className="text-center text-[15px] font-extrabold tracking-[0.08em]"
        style={{ color: INK }}
      >
        SPRACHVERMITTLER<span style={{ color: COPPER }}>24</span>
      </div>
      {withTagline && (
        <div
          className="flex items-center gap-2 text-[9px] font-semibold tracking-[0.15em]"
          style={{ color: COPPER }}
        >
          <span className="h-px w-5" style={{ background: COPPER }} />
          WIR SCHAFFEN VERSTÄNDIGUNG
          <span className="h-px w-5" style={{ background: COPPER }} />
        </div>
      )}
    </div>
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

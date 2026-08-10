import clsx from "clsx";

export type PillTone = "green" | "amber" | "red" | "blue" | "gray";

const TONE_CLASSES: Record<PillTone, string> = {
  green: "bg-pill-green-bg text-pill-green-fg",
  amber: "bg-pill-amber-bg text-pill-amber-fg",
  red: "bg-pill-red-bg text-pill-red-fg",
  blue: "bg-pill-blue-bg text-pill-blue-fg",
  gray: "bg-pill-gray-bg text-pill-gray-fg",
};

export function Pill({
  tone,
  children,
  className,
}: {
  tone: PillTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

import clsx from "clsx";

export function Card({
  className,
  children,
  padded = true,
}: {
  className?: string;
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-[18px] border border-card-border bg-card-bg shadow-[var(--shadow-card-desktop)]",
        padded && "p-[18px]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardMobile({
  className,
  children,
  padded = true,
}: {
  className?: string;
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-[16px] border border-card-border-mobile bg-card-bg shadow-[var(--shadow-card-mobile)]",
        padded && "p-4",
        className
      )}
    >
      {children}
    </div>
  );
}

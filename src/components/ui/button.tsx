import clsx from "clsx";
import { forwardRef } from "react";

type Variant = "primary" | "dark" | "secondary" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navy-soft",
  dark: "bg-[#14151A] text-white hover:opacity-90",
  secondary:
    "bg-transparent border border-field-border text-text-secondary hover:bg-field-bg",
  ghost: "bg-transparent text-text-secondary hover:bg-field-bg",
  danger: "bg-transparent border border-field-border text-pill-red-fg hover:bg-pill-red-bg",
};

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ className, variant = "primary", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
});

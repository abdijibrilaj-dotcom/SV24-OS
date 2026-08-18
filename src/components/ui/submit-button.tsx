"use client";

import { useFormStatus } from "react-dom";
import clsx from "clsx";

/**
 * A <button type="submit"> that disables itself and shows a pending label
 * while its parent <form action={...}> is in flight — must be rendered
 * inside that <form> since useFormStatus reads the nearest ancestor form.
 * Replaces several raw <button>s across admin pages that had no
 * double-submit protection at all (see e.g. dispatch/page.tsx,
 * email-import/page.tsx, rechnungen pages).
 */
export function SubmitButton({
  children,
  pendingText = "Wird gespeichert…",
  variant = "dark",
  className,
  disabled,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: "dark" | "outline" | "link";
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const variantClass = {
    dark: "rounded-[10px] bg-[#14151A] px-[18px] py-2.5 text-[13px] font-semibold text-white hover:opacity-90",
    outline:
      "rounded-[10px] border border-field-border px-[18px] py-2.5 text-[13px] font-semibold text-text-secondary hover:bg-field-bg",
    link: "text-[12.5px] font-semibold text-text-secondary hover:text-text-primary",
  }[variant];

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={clsx(variantClass, "transition disabled:cursor-not-allowed disabled:opacity-50", className)}
    >
      {pending ? pendingText : children}
    </button>
  );
}

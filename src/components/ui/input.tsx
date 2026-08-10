import clsx from "clsx";
import { forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-[10px] border border-field-border bg-field-bg-alt px-3 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-[#93C5FD] focus:bg-white focus:ring-4 focus:ring-[#DBEAFE]",
        className
      )}
      {...props}
    />
  );
});

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-text-secondary">
      {children}
    </label>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 380,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(16,24,40,.35)] p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{ width }}
        className="relative max-w-full rounded-2xl bg-white p-6 shadow-[0_20px_40px_rgba(16,24,40,.2)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary transition hover:bg-field-bg hover:text-text-primary"
        >
          <X size={16} strokeWidth={2} />
        </button>
        <div className="mb-4 pr-6 text-base font-extrabold text-text-primary">
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

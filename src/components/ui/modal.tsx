"use client";

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
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(16,24,40,.35)] p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width }}
        className="max-w-full rounded-2xl bg-white p-6 shadow-[0_20px_40px_rgba(16,24,40,.2)]"
      >
        <div className="mb-4 text-base font-extrabold text-text-primary">
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

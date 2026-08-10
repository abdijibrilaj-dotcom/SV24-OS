"use client";
import clsx from "clsx";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  name?: string;
}) {
  return (
    <div className="inline-flex rounded-[10px] border border-field-border bg-white p-[3px]">
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          name={name}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "rounded-[8px] px-4 py-2 text-[13px] font-bold transition",
            value === opt.value
              ? "bg-navy text-white"
              : "text-text-secondary hover:bg-field-bg"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

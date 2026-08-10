"use client";
import { useState } from "react";
import { Segmented } from "@/components/ui/segmented";

export function SalutationToggle({
  defaultValue = "FRAU",
}: {
  defaultValue?: "HERR" | "FRAU";
}) {
  const [value, setValue] = useState<"HERR" | "FRAU">(defaultValue);
  return (
    <div>
      <label className="mb-1.5 block text-xs text-text-secondary">Anrede</label>
      <input type="hidden" name="salutation" value={value} />
      <Segmented
        options={[
          { value: "HERR", label: "Herr" },
          { value: "FRAU", label: "Frau" },
        ]}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}

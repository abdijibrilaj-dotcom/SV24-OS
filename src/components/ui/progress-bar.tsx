/**
 * Shared labeled progress bar — replaces the plain `h-2 bg-field-bg` divs
 * that were copy-pasted (with slightly different markup each time) across
 * statistiken/page.tsx and umsatz/page.tsx.
 */
export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-field-bg">
      <div
        className="h-full rounded-full bg-gradient-to-r from-navy to-[#2A3A56] transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

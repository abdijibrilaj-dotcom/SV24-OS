export default function InterpreterLoading() {
  return (
    <div className="flex h-screen flex-col gap-2.5 bg-content-bg-mobile p-4 pt-6">
      <div className="mb-2 h-6 w-40 animate-pulse rounded-lg bg-card-bg" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[64px] animate-pulse rounded-[16px] border border-card-border-mobile bg-card-bg shadow-[var(--shadow-card-mobile)]"
        />
      ))}
    </div>
  );
}

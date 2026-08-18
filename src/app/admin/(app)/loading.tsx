export default function AdminLoading() {
  const cardClass = "rounded-[18px] border border-card-border bg-card-bg shadow-[var(--shadow-card-desktop)]";
  return (
    <div className="animate-pulse">
      <div className="mb-6 grid grid-cols-4 gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-[104px] ${cardClass}`} />
        ))}
      </div>
      <div className={`h-[220px] ${cardClass}`} />
    </div>
  );
}

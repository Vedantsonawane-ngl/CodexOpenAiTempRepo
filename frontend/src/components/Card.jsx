export function Card({ children, className = "" }) {
  return <div className={`card-glass rounded p-md ${className}`}>{children}</div>;
}

export function MetricCard({ label, value, icon, tone = "primary" }) {
  const toneClass = tone === "danger" ? "text-error bg-error-container/20" : "text-primary bg-secondary-container/20";

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-geist text-[11px] uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
          <p className="mt-xs text-3xl font-black text-on-surface">{value}</p>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${toneClass}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
    </Card>
  );
}

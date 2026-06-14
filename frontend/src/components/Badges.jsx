export function SeverityBadge({ severity = "Low" }) {
  const value = severity.toLowerCase();
  const styles = {
    high: "bg-error-container/25 text-error border-error/30",
    critical: "bg-error text-on-error border-error",
    medium: "bg-warning/15 text-warning border-warning/30",
    low: "bg-secondary-container/20 text-secondary border-secondary/30"
  };

  return (
    <span className={`text-[10px] px-sm py-[2px] rounded border font-geist uppercase font-bold ${styles[value] || styles.low}`}>
      {severity}
    </span>
  );
}

export function StatusBadge({ status = "New" }) {
  const value = status.toLowerCase();
  const styles = {
    new: "bg-primary/15 text-primary border-primary/25",
    investigating: "bg-warning/15 text-warning border-warning/25",
    ready: "bg-success/15 text-success border-success/25",
    resolved: "bg-success/15 text-success border-success/25",
    approved: "bg-success/15 text-success border-success/25",
    rejected: "bg-error/15 text-error border-error/25",
    "pending human approval": "bg-secondary-container/20 text-secondary border-secondary/30"
  };

  return (
    <span className={`text-[10px] px-sm py-[2px] rounded border font-geist uppercase font-bold ${styles[value] || styles.new}`}>
      {status}
    </span>
  );
}

export function ConfidenceRing({ value = 0, size = 82 }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 88 88" className="-rotate-90">
        <circle cx="44" cy="44" r={radius} stroke="#353436" strokeWidth="8" fill="none" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          stroke="#c0c1ff"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-black text-primary">{value}%</div>
        <div className="text-[9px] font-geist uppercase text-on-surface-variant">Confidence</div>
      </div>
    </div>
  );
}

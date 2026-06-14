import Icon from "./Icon.jsx";

export default function StatusFooter() {
  return (
    <footer className="mt-auto flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest px-margin py-xs font-geist text-[11px] uppercase tracking-[0.05em] text-on-surface-variant">
      <div className="flex items-center gap-lg">
        <span className="flex items-center gap-xs">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          System Ready
        </span>
        <span className="flex items-center gap-xs">
          <Icon name="storage" className="text-[14px]" />
          DB: Connected
        </span>
        <span className="flex items-center gap-xs">
          <Icon name="bolt" className="text-[14px]" />
          Engine: Idle
        </span>
        <span className="flex items-center gap-xs">
          <Icon name="api" className="text-[14px]" />
          API: Fallback Ready
        </span>
      </div>
      <div className="flex items-center gap-md">
        <span>v1.0.0</span>
        <span className="text-primary">Latency: 14ms</span>
      </div>
    </footer>
  );
}

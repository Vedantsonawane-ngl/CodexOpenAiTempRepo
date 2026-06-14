import { useState } from "react";
import { rawLogs } from "../data/mockData.js";

const toneMap = {
  danger: "border-error bg-error-container/25 text-error",
  success: "border-success bg-success/15 text-success",
  warning: "border-warning bg-warning/15 text-warning",
  critical: "border-primary bg-secondary-container/30 text-primary",
  neutral: "border-outline bg-surface-container-highest text-on-surface-variant"
};

export default function Timeline({ events }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="space-y-md">
      {events.map((event, index) => {
        const raw = rawLogs.find((log) => log.id === event.rawLogId);
        const open = openId === event.id;
        return (
          <div key={event.id} className="relative flex gap-md">
            {index < events.length - 1 ? <div className="absolute left-[13px] top-7 h-full w-px bg-outline-variant" /> : null}
            <div className={`z-10 mt-1 h-7 w-7 rounded-full border ${toneMap[event.tone] || toneMap.neutral}`} />
            <div className="flex-1 rounded border border-outline-variant/50 bg-surface-container-lowest p-md">
              <div className="flex items-start justify-between gap-md">
                <div>
                  <p className="font-geist text-[11px] uppercase tracking-[0.08em] text-primary">{event.time}</p>
                  <h4 className="font-bold text-on-surface">{event.title}</h4>
                </div>
                <button className="text-xs text-primary hover:underline" onClick={() => setOpenId(open ? null : event.id)} type="button">
                  {open ? "Hide raw log" : "View raw log"}
                </button>
              </div>
              <div className="mt-sm grid gap-xs text-xs text-on-surface-variant sm:grid-cols-2 lg:grid-cols-4">
                <span>User: {event.user || "n/a"}</span>
                <span>IP: {event.ip || "n/a"}</span>
                <span>Host: {event.host || "n/a"}</span>
                <span>Source: {event.source || "n/a"}</span>
              </div>
              {event.domain ? <p className="mt-xs text-xs text-on-surface-variant">Domain: {event.domain}</p> : null}
              {event.file ? <p className="mt-xs text-xs text-on-surface-variant">File: {event.file}</p> : null}
              {open ? <pre className="mt-sm overflow-x-auto rounded bg-black/40 p-sm font-geist text-xs text-secondary">{raw?.raw}</pre> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

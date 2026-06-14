import { useState } from "react";
import { rawLogs } from "../data/mockData.js";
import { SeverityBadge, StatusBadge } from "./Badges.jsx";

export default function EvidenceTable({ findings }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="overflow-hidden rounded border border-outline-variant">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-container text-[10px] uppercase text-on-surface-variant">
          <tr>
            <th className="border-b border-outline-variant px-md py-xs">Finding</th>
            <th className="border-b border-outline-variant px-md py-xs">Evidence</th>
            <th className="border-b border-outline-variant px-md py-xs">Severity</th>
            <th className="border-b border-outline-variant px-md py-xs">Verification</th>
            <th className="border-b border-outline-variant px-md py-xs">Source Events</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {findings.map((finding) => {
            const isOpen = open === finding.finding;
            const logs = rawLogs.filter((log) => finding.sourceLogIds.includes(log.id));
            return (
              <>
                <tr key={finding.finding} className="hover:bg-surface-container">
                  <td className="px-md py-sm font-semibold text-on-surface">{finding.finding}</td>
                  <td className="px-md py-sm text-on-surface-variant">{finding.evidence}</td>
                  <td className="px-md py-sm">
                    <SeverityBadge severity={finding.severity} />
                  </td>
                  <td className="px-md py-sm">
                    <StatusBadge status={finding.status} />
                  </td>
                  <td className="px-md py-sm">
                    <button className="text-primary hover:underline" onClick={() => setOpen(isOpen ? null : finding.finding)} type="button">
                      {logs.length} source logs
                    </button>
                  </td>
                </tr>
                {isOpen ? (
                  <tr>
                    <td className="bg-black/20 px-md py-sm" colSpan="5">
                      <div className="space-y-xs">
                        {logs.map((log) => (
                          <pre key={log.id} className="overflow-x-auto rounded bg-black/40 p-sm font-geist text-xs text-secondary">
                            {log.raw}
                          </pre>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : null}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { SeverityBadge, StatusBadge } from "../components/Badges.jsx";
import { alerts } from "../data/mockData.js";

export default function Alerts() {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");

  const filtered = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesQuery = `${alert.title} ${alert.id} ${alert.affectedEntity}`.toLowerCase().includes(query.toLowerCase());
      const matchesSeverity = severity === "All" || alert.severity === severity;
      const matchesStatus = status === "All" || alert.status === status;
      return matchesQuery && matchesSeverity && matchesStatus;
    });
  }, [query, severity, status]);

  return (
    <div className="space-y-lg">
      <PageHeader
        eyebrow="Alert Inbox"
        title="Detected Security Alerts"
        description="Review, search, filter, and start investigations for detected SOC alerts."
        actions={
          <Link className="rounded bg-primary px-md py-sm font-geist text-[11px] font-bold uppercase text-on-primary" to="/investigations/new">
            Upload Logs
          </Link>
        }
      />

      <div className="card-glass rounded p-md">
        <div className="mb-md grid gap-md lg:grid-cols-[1fr_160px_160px_auto]">
          <label className="flex items-center rounded border border-outline-variant bg-surface-container-high px-md">
            <Icon name="search" className="mr-sm text-[20px] text-on-surface-variant" />
            <input
              className="w-full border-none bg-transparent py-sm text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0"
              placeholder="Search alerts..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select className="rounded border border-outline-variant bg-surface-container-high p-sm text-sm" value={severity} onChange={(event) => setSeverity(event.target.value)}>
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select className="rounded border border-outline-variant bg-surface-container-high p-sm text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option>
            <option>New</option>
            <option>Investigating</option>
            <option>Resolved</option>
          </select>
          <button className="rounded border border-outline-variant px-md py-sm font-geist text-[11px] font-bold uppercase text-primary" type="button">
            Refresh
          </button>
        </div>

        <div className="overflow-hidden rounded border border-outline-variant">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container font-geist text-[10px] uppercase text-on-surface-variant">
              <tr>
                <th className="border-b border-outline-variant px-md py-xs">Severity</th>
                <th className="border-b border-outline-variant px-md py-xs">Alert ID</th>
                <th className="border-b border-outline-variant px-md py-xs">Title</th>
                <th className="border-b border-outline-variant px-md py-xs">Affected Entity</th>
                <th className="border-b border-outline-variant px-md py-xs">Time</th>
                <th className="border-b border-outline-variant px-md py-xs">Status</th>
                <th className="border-b border-outline-variant px-md py-xs">Confidence</th>
                <th className="border-b border-outline-variant px-md py-xs">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.map((alert) => (
                <tr key={alert.id} className={alert.id === "ALT-1001" ? "bg-secondary-container/5 hover:bg-secondary-container/10" : "hover:bg-surface-container"}>
                  <td className="px-md py-sm">
                    <SeverityBadge severity={alert.severity} />
                  </td>
                  <td className="px-md py-sm font-geist text-xs text-primary">{alert.id}</td>
                  <td className="px-md py-sm font-semibold text-on-surface">{alert.title}</td>
                  <td className="px-md py-sm text-on-surface-variant">{alert.affectedEntity}</td>
                  <td className="px-md py-sm text-on-surface-variant">{alert.createdTime}</td>
                  <td className="px-md py-sm">
                    <StatusBadge status={alert.status} />
                  </td>
                  <td className="px-md py-sm text-on-surface">{alert.confidence}%</td>
                  <td className="px-md py-sm">
                    <Link className="rounded bg-primary px-sm py-xs font-geist text-[10px] font-bold uppercase text-on-primary" to={`/alerts/${alert.id}`}>
                      View Investigation
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <div className="py-xl text-center text-on-surface-variant">
            <Icon name="search_off" className="mb-sm text-[40px]" />
            <p>No alerts match the current filters.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { MetricCard } from "../components/Card.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { SeverityBadge, StatusBadge } from "../components/Badges.jsx";
import { alerts, approvals, reports } from "../data/mockData.js";

export default function Dashboard() {
  const highAlerts = alerts.filter((alert) => alert.severity === "High").length;

  return (
    <div className="space-y-lg">
      <PageHeader
        eyebrow="Overview"
        title="Security Overview"
        description="Operational summary for current alerts, investigations, reports, and human approval actions."
        actions={
          <>
            <Link className="rounded bg-primary px-md py-sm font-geist text-[11px] font-bold uppercase text-on-primary" to="/investigations/new">
              Load Investigation Data
            </Link>
            <Link className="rounded border border-outline-variant px-md py-sm font-geist text-[11px] font-bold uppercase text-primary" to="/alerts">
              Review Alerts
            </Link>
          </>
        }
      />

      <div className="grid gap-md md:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Total Alerts" value={alerts.length} icon="warning" />
        <MetricCard label="High Severity" value={highAlerts} icon="priority_high" tone="danger" />
        <MetricCard label="Investigations" value="4" icon="security" />
        <MetricCard label="Pending Approvals" value={approvals.length} icon="approval_delegation" />
        <MetricCard label="Reports Generated" value={reports.length} icon="description" />
      </div>

      <div className="grid gap-lg lg:grid-cols-3">
        <div className="card-glass rounded p-md lg:col-span-2">
          <div className="mb-md flex items-center justify-between">
            <h3 className="font-bold text-on-surface">Recent Alerts</h3>
            <Link className="text-sm text-primary hover:underline" to="/alerts">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-outline-variant">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-surface-container">
                    <td className="px-sm py-sm">
                      <SeverityBadge severity={alert.severity} />
                    </td>
                    <td className="px-sm py-sm font-semibold text-on-surface">{alert.title}</td>
                    <td className="px-sm py-sm text-on-surface-variant">{alert.affectedEntity}</td>
                    <td className="px-sm py-sm">
                      <StatusBadge status={alert.status} />
                    </td>
                    <td className="px-sm py-sm text-right">
                      <Link className="text-primary hover:underline" to={`/alerts/${alert.id}`}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-glass rounded p-md">
          <h3 className="mb-md font-bold text-on-surface">Severity Distribution</h3>
          <div className="space-y-md">
            <div>
              <div className="mb-xs flex justify-between text-sm">
                <span>High</span>
                <span>{highAlerts}</span>
              </div>
              <div className="h-2 rounded bg-surface-container-high">
                <div className="h-2 rounded bg-error" style={{ width: `${(highAlerts / alerts.length) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-xs flex justify-between text-sm">
                <span>Medium</span>
                <span>1</span>
              </div>
              <div className="h-2 rounded bg-surface-container-high">
                <div className="h-2 rounded bg-warning" style={{ width: "25%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

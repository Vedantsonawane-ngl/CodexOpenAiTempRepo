import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { Card } from "../components/Card.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProgressModal from "../components/ProgressModal.jsx";
import { ConfidenceRing, SeverityBadge, StatusBadge } from "../components/Badges.jsx";
import { alerts, investigation, rawLogs } from "../data/mockData.js";

export default function AlertDetails() {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const [progressOpen, setProgressOpen] = useState(false);
  const alert = useMemo(() => alerts.find((item) => item.id === alertId) || alerts[0], [alertId]);

  const finishRun = useCallback(async () => {
    await api.runInvestigation(alert.id);
    navigate(`/investigations/${alert.investigationId}`);
  }, [alert.id, alert.investigationId, navigate]);

  return (
    <div className="space-y-lg">
      <PageHeader
        eyebrow="Alert Details"
        title={alert.title}
        description={alert.description}
        actions={
          <>
            <Link className="rounded border border-outline-variant px-md py-sm font-geist text-[11px] font-bold uppercase text-primary" to="/alerts">
              Back to Alerts
            </Link>
            <button className="rounded bg-primary px-md py-sm font-geist text-[11px] font-bold uppercase text-on-primary" onClick={() => setProgressOpen(true)} type="button">
              Run Investigation
            </button>
          </>
        }
      />

      <div className="grid gap-lg lg:grid-cols-[1fr_280px]">
        <div className="space-y-lg">
          <Card>
            <div className="grid gap-md md:grid-cols-4">
              <div>
                <p className="font-geist text-[11px] uppercase text-on-surface-variant">Alert ID</p>
                <p className="font-bold text-primary">{alert.id}</p>
              </div>
              <div>
                <p className="font-geist text-[11px] uppercase text-on-surface-variant">Affected User</p>
                <p className="font-bold">{alert.affectedEntity}</p>
              </div>
              <div>
                <p className="font-geist text-[11px] uppercase text-on-surface-variant">Severity</p>
                <SeverityBadge severity={alert.severity} />
              </div>
              <div>
                <p className="font-geist text-[11px] uppercase text-on-surface-variant">Status</p>
                <StatusBadge status={alert.status} />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-md font-bold text-on-surface">Associated Raw Logs</h3>
            <div className="space-y-xs">
              {rawLogs.map((log) => (
                <pre key={log.id} className="overflow-x-auto rounded border border-outline-variant/40 bg-black/30 p-sm font-geist text-xs text-secondary">
                  {log.raw}
                </pre>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-lg">
          <Card className="grid place-items-center">
            <ConfidenceRing value={alert.confidence} />
          </Card>
          <Card>
            <h3 className="mb-md font-bold text-on-surface">Extracted Entity Preview</h3>
            <div className="space-y-sm">
              {Object.entries(investigation.entities).map(([type, values]) => (
                <div key={type}>
                  <p className="mb-xs font-geist text-[10px] uppercase text-on-surface-variant">{type}</p>
                  <div className="flex flex-wrap gap-xs">
                    {values.map((value) => (
                      <span key={value} className="rounded border border-outline-variant/50 bg-surface-container-highest px-sm py-[2px] text-[10px] text-secondary">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <ProgressModal open={progressOpen} onComplete={finishRun} />
    </div>
  );
}

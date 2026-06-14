import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { Card } from "../components/Card.jsx";
import EvidenceTable from "../components/EvidenceTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Timeline from "../components/Timeline.jsx";
import { ConfidenceRing, SeverityBadge, StatusBadge } from "../components/Badges.jsx";
import { investigation } from "../data/mockData.js";

export default function Investigation() {
  const { investigationId } = useParams();
  const [currentInvestigation, setCurrentInvestigation] = useState(investigation);

  useEffect(() => {
    api.getInvestigationById(investigationId).then(setCurrentInvestigation);
  }, [investigationId]);

  return (
    <div className="space-y-lg">
      <PageHeader
        eyebrow={`${currentInvestigation.id} / ${currentInvestigation.alertId}`}
        title={currentInvestigation.attackType}
        description={currentInvestigation.summary}
        actions={
          <>
            <Link className="rounded border border-outline-variant px-md py-sm font-geist text-[11px] font-bold uppercase text-primary" to="/alerts">
              Back to Alerts
            </Link>
            <Link className="rounded bg-primary px-md py-sm font-geist text-[11px] font-bold uppercase text-on-primary" to={`/reports/${currentInvestigation.reportId || "RPT-1001"}`}>
              Generate Report
            </Link>
          </>
        }
      />

      <div className="grid gap-lg lg:grid-cols-[1fr_320px]">
        <div className="space-y-lg">
          <Card>
            <div className="mb-md flex flex-wrap items-center gap-md">
              <SeverityBadge severity={currentInvestigation.severity} />
              <StatusBadge status={currentInvestigation.status} />
              <span className="font-geist text-[11px] uppercase text-on-surface-variant">User: {currentInvestigation.user}</span>
            </div>
            <h3 className="mb-sm font-bold text-on-surface">Evidence-Backed Investigation Analysis</h3>
            <p className="text-sm leading-6 text-on-surface-variant">{currentInvestigation.reasoning}</p>
          </Card>

          <Card>
            <h3 className="mb-md font-bold text-on-surface">Correlated Timeline</h3>
            <Timeline events={currentInvestigation.timeline} />
          </Card>

          <Card>
            <h3 className="mb-md font-bold text-on-surface">Evidence-Backed Findings</h3>
            <EvidenceTable findings={currentInvestigation.findings} />
          </Card>

          <Card>
            <h3 className="mb-md font-bold text-on-surface">MITRE ATT&CK Mapping</h3>
            <div className="grid gap-md md:grid-cols-3">
              {currentInvestigation.mitre.map((item) => (
                <div key={item.techniqueId} className="rounded border border-outline-variant bg-surface-container-lowest p-md">
                  <p className="font-geist text-[11px] font-bold uppercase text-primary">{item.techniqueId}</p>
                  <h4 className="mt-xs font-bold text-on-surface">{item.technique}</h4>
                  <p className="mt-xs text-sm text-on-surface-variant">{item.relatedFinding}</p>
                  <p className="mt-sm text-xs text-secondary">Confidence {item.confidence}%</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-lg lg:sticky lg:top-20 lg:self-start">
          <Card className="grid place-items-center">
            <ConfidenceRing value={currentInvestigation.confidence} />
          </Card>

          <Card>
            <h3 className="mb-md font-bold text-on-surface">Investigation Summary</h3>
            <dl className="space-y-sm text-sm">
              <div className="flex justify-between gap-md">
                <dt className="text-on-surface-variant">Attack</dt>
                <dd>{currentInvestigation.attackType}</dd>
              </div>
              <div className="flex justify-between gap-md">
                <dt className="text-on-surface-variant">Suspicious Location</dt>
                <dd>{currentInvestigation.suspiciousLocation}</dd>
              </div>
              <div className="flex justify-between gap-md">
                <dt className="text-on-surface-variant">Failed Logins</dt>
                <dd>{currentInvestigation.failedLoginCount}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h3 className="mb-md font-bold text-on-surface">Extracted Entities</h3>
            <div className="space-y-sm">
              {Object.entries(currentInvestigation.entities).map(([type, values]) => (
                <div key={type}>
                  <p className="mb-xs font-geist text-[10px] uppercase text-on-surface-variant">{type}</p>
                  <div className="flex flex-wrap gap-xs">
                    {values.map((value) => (
                      <span key={value} className="rounded border border-primary/20 bg-secondary-container/10 px-sm py-[2px] text-[10px] text-secondary">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-md font-bold text-on-surface">Recommended Actions</h3>
            <div className="space-y-sm">
              {currentInvestigation.recommendations.map((action) => (
                <Link key={action} className="block rounded border border-outline-variant bg-surface-container-high px-md py-sm text-sm text-primary hover:bg-surface-container-highest" to="/approvals">
                  {action}
                  <span className="block text-xs text-on-surface-variant">Pending Human Approval</span>
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

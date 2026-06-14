import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { Card } from "../components/Card.jsx";
import EvidenceTable from "../components/EvidenceTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Timeline from "../components/Timeline.jsx";
import { ConfidenceRing, SeverityBadge } from "../components/Badges.jsx";
import { investigation, reports } from "../data/mockData.js";

export default function ReportDetails() {
  const { reportId } = useParams();
  const fallbackReport = reports.find((item) => item.id === reportId) || reports[0];
  const [report, setReport] = useState({ ...fallbackReport, summary: investigation.summary, investigation });
  const currentInvestigation = report.investigation || investigation;

  useEffect(() => {
    api.getReport(reportId).then(setReport);
  }, [reportId]);

  return (
    <div className="space-y-lg">
      <PageHeader
        eyebrow={reportId}
        title={report.title || "Incident Report"}
        description={`Evidence-backed report generated from ${currentInvestigation.attackType}.`}
        actions={
          <>
            <button className="rounded border border-outline-variant px-md py-sm font-geist text-[11px] font-bold uppercase text-primary" onClick={() => window.print()} type="button">
              Print
            </button>
            <button className="rounded bg-primary px-md py-sm font-geist text-[11px] font-bold uppercase text-on-primary" type="button">
              Download Incident Report
            </button>
          </>
        }
      />

      <div className="grid gap-lg lg:grid-cols-[1fr_260px]">
        <div className="space-y-lg">
          <Card>
            <h3 className="mb-sm text-lg font-bold text-on-surface">Executive Summary</h3>
            <p className="text-sm leading-6 text-on-surface-variant">{report.summary || currentInvestigation.summary}</p>
          </Card>

          <Card>
            <h3 className="mb-md text-lg font-bold text-on-surface">Technical Timeline</h3>
            <Timeline events={currentInvestigation.timeline} />
          </Card>

          <Card>
            <h3 className="mb-md text-lg font-bold text-on-surface">Findings and Evidence</h3>
            <EvidenceTable findings={currentInvestigation.findings} />
          </Card>

          <Card>
            <h3 className="mb-md text-lg font-bold text-on-surface">Recommendations</h3>
            <ul className="list-inside list-disc space-y-xs text-sm text-on-surface-variant">
              {currentInvestigation.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="space-y-lg">
          <Card className="grid place-items-center">
            <ConfidenceRing value={currentInvestigation.confidence} />
          </Card>
          <Card>
            <h3 className="mb-md font-bold text-on-surface">Report Details</h3>
            <div className="space-y-sm text-sm">
              <div className="flex justify-between gap-md">
                <span className="text-on-surface-variant">Severity</span>
                <SeverityBadge severity={currentInvestigation.severity} />
              </div>
              <div className="flex justify-between gap-md">
                <span className="text-on-surface-variant">Alert</span>
                <span>{currentInvestigation.alertId}</span>
              </div>
              <div className="flex justify-between gap-md">
                <span className="text-on-surface-variant">Investigation</span>
                <span>{currentInvestigation.id}</span>
              </div>
            </div>
          </Card>
          <Link className="block rounded border border-outline-variant px-md py-sm text-center font-geist text-[11px] font-bold uppercase text-primary" to={`/investigations/${currentInvestigation.id}`}>
            Back to Investigation
          </Link>
        </aside>
      </div>
    </div>
  );
}

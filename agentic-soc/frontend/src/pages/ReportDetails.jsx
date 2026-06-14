import { Link, useParams } from "react-router-dom";
import { Card } from "../components/Card.jsx";
import EvidenceTable from "../components/EvidenceTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Timeline from "../components/Timeline.jsx";
import { ConfidenceRing, SeverityBadge } from "../components/Badges.jsx";
import { investigation } from "../data/mockData.js";

export default function ReportDetails() {
  const { reportId } = useParams();

  return (
    <div className="space-y-lg">
      <PageHeader
        eyebrow={reportId}
        title="Incident Report"
        description="Evidence-backed report generated from the credential compromise investigation."
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
            <p className="text-sm leading-6 text-on-surface-variant">
              A possible credential compromise was detected for riya@acme.com. Multiple failed login attempts were followed by a successful login from a suspicious location and an MFA bypass event.
            </p>
          </Card>

          <Card>
            <h3 className="mb-md text-lg font-bold text-on-surface">Technical Timeline</h3>
            <Timeline events={investigation.timeline} />
          </Card>

          <Card>
            <h3 className="mb-md text-lg font-bold text-on-surface">Findings and Evidence</h3>
            <EvidenceTable findings={investigation.findings} />
          </Card>

          <Card>
            <h3 className="mb-md text-lg font-bold text-on-surface">Recommendations</h3>
            <ul className="list-inside list-disc space-y-xs text-sm text-on-surface-variant">
              {investigation.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="space-y-lg">
          <Card className="grid place-items-center">
            <ConfidenceRing value={investigation.confidence} />
          </Card>
          <Card>
            <h3 className="mb-md font-bold text-on-surface">Report Details</h3>
            <div className="space-y-sm text-sm">
              <div className="flex justify-between gap-md">
                <span className="text-on-surface-variant">Severity</span>
                <SeverityBadge severity={investigation.severity} />
              </div>
              <div className="flex justify-between gap-md">
                <span className="text-on-surface-variant">Alert</span>
                <span>{investigation.alertId}</span>
              </div>
              <div className="flex justify-between gap-md">
                <span className="text-on-surface-variant">Investigation</span>
                <span>{investigation.id}</span>
              </div>
            </div>
          </Card>
          <Link className="block rounded border border-outline-variant px-md py-sm text-center font-geist text-[11px] font-bold uppercase text-primary" to="/investigations/INV-1001">
            Back to Investigation
          </Link>
        </aside>
      </div>
    </div>
  );
}

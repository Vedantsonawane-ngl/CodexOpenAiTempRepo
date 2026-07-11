import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { Card } from "../components/Card.jsx";
import EvidenceTable from "../components/EvidenceTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Timeline from "../components/Timeline.jsx";
import { ConfidenceRing, SeverityBadge } from "../components/Badges.jsx";
import { investigation, reports } from "../data/mockData.js";
import { useNotifications } from "../context/NotificationContext.jsx";
import { jsPDF } from "jspdf";

export default function ReportDetails() {
  const { reportId } = useParams();
  const fallbackReport = reports.find((item) => item.id === reportId) || reports[0];
  const [report, setReport] = useState({ ...fallbackReport, summary: investigation.summary, investigation });
  const currentInvestigation = report.investigation || investigation;
  const { addNotification } = useNotifications();

  useEffect(() => {
    api.getReport(reportId).then(setReport);
  }, [reportId]);

  const downloadReport = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const title = report.title || "Incident Report";
    const reportNum = reportId || "RPT-1001";
    const severity = currentInvestigation.severity || "High";
    const confidence = currentInvestigation.confidence || 90;
    const attackType = currentInvestigation.attackType || "Unknown";
    const summary = report.summary || currentInvestigation.summary || "";

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // Header Panel
    doc.setFillColor(15, 15, 17);
    doc.rect(0, 0, pageWidth, 45, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(173, 102, 255);
    doc.text("intelliSOC Incident Report", margin, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`Report ID: ${reportNum} | Severity: ${severity} | Confidence: ${confidence}%`, margin, 26);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Classification: Internal Use Only`, margin, 32);

    doc.setDrawColor(80, 80, 80);
    doc.line(margin, 40, pageWidth - margin, 40);

    y = 55;

    const drawSectionHeader = (titleText) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(173, 102, 255);
      doc.text(titleText, margin, y);
      y += 6;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    };

    // Executive Summary
    drawSectionHeader("1. Executive Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    const splitSummary = doc.splitTextToSize(summary, contentWidth);
    doc.text(splitSummary, margin, y);
    y += splitSummary.length * 5 + 12;

    // Profile Details
    drawSectionHeader("2. Incident Profile");
    doc.setFont("helvetica", "bold");
    doc.text("Attack Vector:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(attackType, margin + 40, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Affected User:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(currentInvestigation.user || "N/A", margin + 40, y);
    y += 15;

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Key Findings
    drawSectionHeader("3. Analysis & Key Findings");
    doc.setFont("helvetica", "normal");

    currentInvestigation.findings.forEach((finding, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${finding.finding}`, margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.text(`Severity: ${finding.severity}`, margin + 5, y);
      y += 5;

      const splitEvidence = doc.splitTextToSize(`Evidence: ${finding.evidence}`, contentWidth - 10);
      doc.text(splitEvidence, margin + 5, y);
      y += splitEvidence.length * 4.5 + 6;
    });

    y += 6;

    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    // Recommendations
    drawSectionHeader("4. Mitigation & Recommendations");
    doc.setFont("helvetica", "normal");

    currentInvestigation.recommendations.forEach((rec, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const splitRec = doc.splitTextToSize(`• ${rec}`, contentWidth);
      doc.text(splitRec, margin, y);
      y += splitRec.length * 5 + 2;
    });

    doc.save(`incident_report_${reportNum}.pdf`);
    addNotification(`Incident report ${reportNum} downloaded successfully as PDF!`, "success");
  };

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
            <button className="rounded bg-primary px-md py-sm font-geist text-[11px] font-bold uppercase text-on-primary" onClick={downloadReport} type="button">
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

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import { SeverityBadge, StatusBadge } from "../components/Badges.jsx";
import { reports as mockReports } from "../data/mockData.js";

export default function Reports() {
  const [reports, setReports] = useState(mockReports);

  useEffect(() => {
    api.getReports().then(setReports);
  }, []);

  return (
    <div className="space-y-lg">
      <PageHeader eyebrow="Reports" title="Generated Incident Reports" description="Search and review reports generated from completed investigations." />
      <div className="card-glass overflow-hidden rounded p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container font-geist text-[10px] uppercase text-on-surface-variant">
            <tr>
              <th className="border-b border-outline-variant px-md py-xs">Report ID</th>
              <th className="border-b border-outline-variant px-md py-xs">Investigation</th>
              <th className="border-b border-outline-variant px-md py-xs">Alert</th>
              <th className="border-b border-outline-variant px-md py-xs">Attack</th>
              <th className="border-b border-outline-variant px-md py-xs">Severity</th>
              <th className="border-b border-outline-variant px-md py-xs">Status</th>
              <th className="border-b border-outline-variant px-md py-xs">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-surface-container">
                <td className="px-md py-sm font-geist text-primary">{report.id}</td>
                <td className="px-md py-sm">{report.investigationId}</td>
                <td className="px-md py-sm">{report.title}</td>
                <td className="px-md py-sm">{report.attackType}</td>
                <td className="px-md py-sm">
                  <SeverityBadge severity={report.severity} />
                </td>
                <td className="px-md py-sm">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-md py-sm">
                  <Link className="text-primary hover:underline" to={`/reports/${report.id}`}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

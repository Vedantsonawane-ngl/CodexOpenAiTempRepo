import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { Card } from "../components/Card.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { investigation } from "../data/mockData.js";

export default function Entities() {
  const [currentInvestigation, setCurrentInvestigation] = useState(investigation);
  const entityTypes = Object.keys(currentInvestigation.entities);
  const [activeType, setActiveType] = useState(entityTypes[0]);
  const [selected, setSelected] = useState(currentInvestigation.entities[entityTypes[0]][0]);

  useEffect(() => {
    api.getInvestigation().then((nextInvestigation) => {
      const nextTypes = Object.keys(nextInvestigation.entities);
      setCurrentInvestigation(nextInvestigation);
      setActiveType(nextTypes[0]);
      setSelected(nextInvestigation.entities[nextTypes[0]][0]);
    });
  }, []);

  const rows = useMemo(() => {
    return (currentInvestigation.entities[activeType] || []).map((value, index) => ({
      value,
      type: activeType,
      risk: activeType === "Countries" && value === "RU" ? "High" : index === 0 ? "Medium" : "Low",
      relatedAlerts: 1,
      relatedInvestigations: 1,
      firstSeen: "09:12",
      lastSeen: "09:29",
      eventCount: activeType === "Users" ? 8 : 2
    }));
  }, [activeType, currentInvestigation.entities]);

  return (
    <div className="space-y-lg">
      <PageHeader
        eyebrow="Entity Explorer"
        title="Extracted Investigation Entities"
        description="Browse users, IP addresses, hosts, domains, files, and countries extracted by the backend entity extractor."
      />

      <div className="flex flex-wrap gap-sm">
        {entityTypes.map((type) => (
          <button
            key={type}
            className={`rounded px-md py-sm font-geist text-[11px] font-bold uppercase ${
              activeType === type ? "bg-primary text-on-primary" : "border border-outline-variant text-primary"
            }`}
              onClick={() => {
                setActiveType(type);
                setSelected(currentInvestigation.entities[type][0]);
              }}
            type="button"
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid gap-lg lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container font-geist text-[10px] uppercase text-on-surface-variant">
              <tr>
                <th className="border-b border-outline-variant px-md py-xs">Entity</th>
                <th className="border-b border-outline-variant px-md py-xs">Type</th>
                <th className="border-b border-outline-variant px-md py-xs">Risk</th>
                <th className="border-b border-outline-variant px-md py-xs">Alerts</th>
                <th className="border-b border-outline-variant px-md py-xs">Events</th>
                <th className="border-b border-outline-variant px-md py-xs">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {rows.map((row) => (
                <tr key={row.value} className="cursor-pointer hover:bg-surface-container" onClick={() => setSelected(row.value)}>
                  <td className="px-md py-sm font-semibold text-primary">{row.value}</td>
                  <td className="px-md py-sm text-on-surface-variant">{row.type}</td>
                  <td className="px-md py-sm">{row.risk}</td>
                  <td className="px-md py-sm">{row.relatedAlerts}</td>
                  <td className="px-md py-sm">{row.eventCount}</td>
                  <td className="px-md py-sm">{row.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <p className="font-geist text-[11px] uppercase text-on-surface-variant">Selected Entity</p>
          <h3 className="mt-xs break-words text-lg font-bold text-primary">{selected}</h3>
          <div className="mt-md space-y-sm text-sm">
            <p className="text-on-surface-variant">Related alert: {currentInvestigation.alertId}</p>
            <p className="text-on-surface-variant">Related investigation: {currentInvestigation.id}</p>
            <p className="text-on-surface-variant">Source: Correlated {currentInvestigation.attackType} timeline</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

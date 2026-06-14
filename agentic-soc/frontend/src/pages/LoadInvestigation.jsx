import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { Card } from "../components/Card.jsx";
import Icon from "../components/Icon.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProgressModal from "../components/ProgressModal.jsx";
import UploadDropzone from "../components/UploadDropzone.jsx";
import { normalizationPreview, scenarioCards } from "../data/mockData.js";

function ScenarioCard({ scenario }) {
  const [state, setState] = useState("idle");
  const high = scenario.tone === "high" || scenario.tone === "critical";
  const low = scenario.tone === "low";

  function loadScenario() {
    if (state !== "idle") return;
    setState("loading");
    window.setTimeout(() => setState("loaded"), 900);
  }

  return (
    <div className="card-glass group flex h-full flex-col justify-between rounded p-md">
      <div>
        <div className="mb-md flex items-start justify-between">
          <span
            className={`rounded border px-sm py-xs font-geist text-[11px] font-bold uppercase ${
              high ? "border-error/30 bg-error-container/20 text-error" : "border-secondary/30 bg-secondary-container/20 text-secondary"
            }`}
          >
            {scenario.severity}
          </span>
          <span className="flex items-center gap-xs text-sm text-on-surface-variant">
            <Icon name="event_note" className="text-[16px]" />
            {scenario.events} Events
          </span>
        </div>
        <h4 className="mb-xs text-lg font-bold text-on-surface">{scenario.title}</h4>
        <p className="mb-md text-sm text-on-surface-variant">{scenario.description}</p>
        <div className="mb-lg flex flex-wrap gap-xs">
          {scenario.tags.map((tag) => (
            <span key={tag} className="rounded border border-outline-variant/50 bg-surface-container-highest px-sm py-[2px] text-[10px] text-on-surface-variant">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <button
        className={`w-full rounded py-sm font-geist text-[11px] font-bold uppercase transition-all active:scale-95 ${
          low ? "border border-outline-variant/30 bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high" : "bg-primary text-on-primary hover:opacity-90"
        } ${state === "loaded" ? "bg-emerald-600 text-white" : ""}`}
        onClick={loadScenario}
        type="button"
      >
        {state === "loading" ? (
          <span className="inline-flex items-center gap-xs">
            <Icon name="progress_activity" className="text-[16px] animate-spin" />
            Loading...
          </span>
        ) : state === "loaded" ? (
          "Loaded"
        ) : (
          "Load Scenario"
        )}
      </button>
    </div>
  );
}

export default function LoadInvestigation() {
  const navigate = useNavigate();
  const [progressOpen, setProgressOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("Ready");

  const handleFile = useCallback(async () => {
    setUploadStatus("Uploading and validating logs...");
    const result = await api.uploadLogs([]);
    setUploadStatus(`Upload accepted. ${result.processed} events ready for normalization.`);
  }, []);

  return (
    <>
      <section className="space-y-lg">
        <PageHeader
          eyebrow="Demo Scenarios"
          title="Load Investigation Data"
          description="Select a pre-configured scenario or upload raw forensic data for rule-based normalization, entity extraction, and event correlation."
          actions={
            <button className="flex items-center gap-xs rounded border border-outline-variant bg-surface-container-high px-md py-xs font-geist text-[11px] font-bold uppercase transition-colors hover:bg-surface-container-highest" type="button">
              <Icon name="filter_list" className="text-[16px]" />
              Filter
            </button>
          }
        />

        <div className="grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-3">
          {scenarioCards.map((scenario) => (
            <ScenarioCard key={scenario.title} scenario={scenario} />
          ))}
          <div className="group flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-outline-variant/30 p-xl transition-all hover:border-primary/50">
            <Icon name="add_circle" className="mb-md text-[40px] text-outline transition-colors group-hover:text-primary" />
            <p className="font-geist text-[11px] font-bold uppercase text-on-surface-variant transition-colors group-hover:text-primary">
              Create Custom Scenario
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-lg lg:grid-cols-3">
        <div className="space-y-lg lg:col-span-2">
          <PageHeader
            eyebrow="Manual Log Ingestion"
            title="Upload Logs"
            description="Upload raw data for backend-powered parsing and normalization preview."
          />
          <UploadDropzone onFile={handleFile} />
          <p className="text-sm text-primary">{uploadStatus}</p>

          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-high px-md py-sm">
              <span className="font-geist text-[11px] font-bold uppercase text-primary">Normalization Preview</span>
              <span className="text-[10px] text-on-surface-variant">Detected: intelliSOC Unified Schema v1</span>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container font-geist text-[10px] uppercase text-on-surface-variant">
                  <tr>
                    <th className="border-b border-outline-variant px-md py-xs">Timestamp</th>
                    <th className="border-b border-outline-variant px-md py-xs">User Entity</th>
                    <th className="border-b border-outline-variant px-md py-xs">Source IP</th>
                    <th className="border-b border-outline-variant px-md py-xs">Host/Domain</th>
                    <th className="border-b border-outline-variant px-md py-xs">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {normalizationPreview.map((row) => (
                    <tr key={`${row.timestamp}-${row.action}`} className="transition-colors hover:bg-surface-container">
                      <td className="px-md py-sm font-geist text-xs text-on-surface-variant">{row.timestamp}</td>
                      <td className="px-md py-sm text-primary">{row.user}</td>
                      <td className="px-md py-sm text-on-surface">{row.ip}</td>
                      <td className="px-md py-sm text-on-surface">{row.host}</td>
                      <td className="px-md py-sm">
                        <span className="rounded border border-secondary/20 bg-secondary-container/10 px-sm py-[2px] text-[10px] text-secondary">
                          {row.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-lg">
          <Card className="flex h-full flex-col border-t-4 border-t-primary p-lg">
            <div className="mb-lg">
              <h4 className="mb-xs text-lg font-bold uppercase tracking-tight text-on-surface">Process Intelligence</h4>
              <p className="text-sm text-on-surface-variant">Rule-based normalization, entity extraction, and event correlation.</p>
            </div>
            <div className="flex-1 space-y-md">
              <label className="block space-y-xs">
                <span className="font-geist text-[11px] uppercase text-on-surface-variant">Investigation Mode</span>
                <select className="w-full rounded border border-outline-variant bg-surface-container-high p-sm text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary">
                  <option>Standard Investigative Graph</option>
                  <option>Time-Series Correlation</option>
                  <option>Entity Extraction First</option>
                </select>
              </label>
              <label className="block space-y-xs">
                <span className="font-geist text-[11px] uppercase text-on-surface-variant">Risk Scoring Engine</span>
                <select className="w-full rounded border border-outline-variant bg-surface-container-high p-sm text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary">
                  <option>intelliSOC Default Weighted Rules</option>
                  <option>NIST 800-53 Compliance</option>
                  <option>Custom Heuristic Engine</option>
                </select>
              </label>
              <div className="space-y-md pt-lg">
                <label className="flex items-center gap-md">
                  <input className="h-4 w-4 rounded border-outline-variant bg-surface-container-high text-primary" type="checkbox" />
                  <span className="text-sm text-on-surface-variant">Enrich with threat intelligence context</span>
                </label>
                <label className="flex items-center gap-md">
                  <input checked readOnly className="h-4 w-4 rounded border-outline-variant bg-surface-container-high text-primary" type="checkbox" />
                  <span className="text-sm text-on-surface-variant">Generate containment recommendations</span>
                </label>
              </div>
            </div>
            <div className="space-y-sm pt-xl">
              <button className="flex w-full items-center justify-center gap-md rounded bg-primary-container py-md font-geist text-[11px] font-black uppercase text-on-primary-container transition-all hover:opacity-90 active:scale-95" type="button">
                <Icon name="data_object" />
                Normalize Logs
              </button>
              <button
                className="flex w-full items-center justify-center gap-md rounded bg-primary py-md font-geist text-[11px] font-black uppercase text-on-primary shadow-glow transition-all hover:opacity-90 active:scale-95"
                onClick={() => setProgressOpen(true)}
                type="button"
              >
                <Icon name="rocket_launch" />
                Run Investigation
              </button>
            </div>
          </Card>
        </div>
      </section>

      <ProgressModal open={progressOpen} onComplete={() => navigate("/investigations/INV-1001")} />
    </>
  );
}

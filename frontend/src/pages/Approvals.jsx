import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { Card } from "../components/Card.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { StatusBadge } from "../components/Badges.jsx";
import { approvals as initialApprovals } from "../data/mockData.js";
import { useNotifications } from "../context/NotificationContext.jsx";

export default function Approvals() {
  const [approvals, setApprovals] = useState(initialApprovals);
  const [modal, setModal] = useState(null);
  const [comment, setComment] = useState("");
  const { addNotification } = useNotifications();

  useEffect(() => {
    api.getApprovals().then(setApprovals);
  }, []);

  async function updateStatus(nextStatus) {
    if (!modal) return;
    if (nextStatus === "Approved") {
      await api.approveAction(modal.id, comment);
      addNotification(`Approved containment action: ${modal.action} on target ${modal.target}`, "success");
    } else {
      await api.rejectAction(modal.id, comment);
      addNotification(`Rejected containment action: ${modal.action} on target ${modal.target}`, "warning");
    }
    setApprovals((items) => items.map((item) => (item.id === modal.id ? { ...item, status: nextStatus } : item)));
    setModal(null);
    setComment("");
  }

  return (
    <div className="space-y-lg">
      <PageHeader
        eyebrow="Human Approval Workflow"
        title="Containment Approval Queue"
        description="Recommended containment actions wait here until a human analyst approves or rejects them."
      />

      <div className="grid gap-md">
        {approvals.map((item) => (
          <Card key={item.id}>
            <div className="grid gap-md lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="mb-sm flex flex-wrap items-center gap-sm">
                  <StatusBadge status={item.status} />
                  <span className="font-geist text-[11px] uppercase text-on-surface-variant">{item.id}</span>
                  <span className="font-geist text-[11px] uppercase text-on-surface-variant">{item.investigationId}</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">{item.action}</h3>
                <p className="text-sm text-on-surface-variant">Target: {item.target}</p>
                <p className="mt-sm text-sm text-on-surface-variant">Evidence: {item.evidence}</p>
              </div>
              <div className="flex gap-sm">
                <button className="rounded border border-outline-variant px-md py-sm font-geist text-[11px] font-bold uppercase text-primary" onClick={() => setModal({ ...item, intent: "Rejected" })} type="button">
                  Reject
                </button>
                <button className="rounded bg-primary px-md py-sm font-geist text-[11px] font-bold uppercase text-on-primary" onClick={() => setModal({ ...item, intent: "Approved" })} type="button">
                  Approve
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-lg backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-primary/20 bg-surface-container-low p-lg">
            <p className="font-geist text-[11px] uppercase text-primary">{modal.intent} Action</p>
            <h3 className="mt-xs text-xl font-bold text-on-surface">{modal.action}</h3>
            <p className="mt-sm text-sm text-on-surface-variant">Target: {modal.target}</p>
            <p className="mt-sm text-sm text-on-surface-variant">Expected impact: {modal.riskImpact}</p>
            <label className="mt-md block">
              <span className="font-geist text-[11px] uppercase text-on-surface-variant">Analyst Comment</span>
              <textarea className="mt-xs min-h-24 w-full rounded border border-outline-variant bg-surface-container-high p-sm text-sm" value={comment} onChange={(event) => setComment(event.target.value)} />
            </label>
            <div className="mt-lg flex justify-end gap-sm">
              <button className="rounded border border-outline-variant px-md py-sm text-primary" onClick={() => setModal(null)} type="button">
                Cancel
              </button>
              <button className="rounded bg-primary px-md py-sm font-bold text-on-primary" onClick={() => updateStatus(modal.intent)} type="button">
                Confirm {modal.intent}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

import { alerts, approvals, investigation, rawLogs, reports, scenarioCards } from "../data/mockData.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, options = {}, fallback) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.info(`Using mock data for ${path}: ${error.message}`);
    return fallback;
  }
}

export const api = {
  getAlerts() {
    return request("/alerts", {}, alerts);
  },
  getAlert(alertId) {
    const fallback = alerts.find((alert) => alert.id === alertId) || alerts[0];
    return request(`/alerts/${alertId}`, {}, { ...fallback, logs: rawLogs, entities: investigation.entities });
  },
  uploadLogs(logs) {
    return request(
      "/logs/upload",
      {
        method: "POST",
        body: JSON.stringify({ logs })
      },
      {
        processed: logs.length || rawLogs.length,
        detected_alerts: [alerts[0]],
        status: "accepted"
      }
    );
  },
  runInvestigation(alertId) {
    return request(
      `/investigations/run/${alertId}`,
      {
        method: "POST"
      },
      { investigation_id: investigation.id, ...investigation }
    );
  },
  getInvestigation() {
    return request(`/investigations/${investigation.id}`, {}, investigation);
  },
  getInvestigationById(investigationId) {
    return request(`/investigations/${investigationId}`, {}, investigation);
  },
  getApprovals() {
    return request("/approvals", {}, approvals);
  },
  approveAction(actionId, comment) {
    return request(
      `/approvals/${actionId}/approve`,
      {
        method: "POST",
        body: JSON.stringify({ comment })
      },
      { id: actionId, status: "Approved", comment }
    );
  },
  rejectAction(actionId, comment) {
    return request(
      `/approvals/${actionId}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ comment })
      },
      { id: actionId, status: "Rejected", comment }
    );
  },
  getReports() {
    return request("/reports", {}, reports);
  },
  getScenarios() {
    return request("/scenarios", {}, scenarioCards);
  },
  getReport(reportId) {
    const fallback = {
      ...reports[0],
      id: reportId,
      summary:
        "A possible credential compromise was detected for riya@acme.com. Multiple failed login attempts were followed by a successful login from a suspicious location and an MFA bypass event.",
      investigation,
      rawLogs
    };

    return request(`/reports/${reportId}`, {}, fallback);
  }
};

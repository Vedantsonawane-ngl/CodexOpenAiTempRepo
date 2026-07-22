import { alerts, approvals, investigation, rawLogs, reports, scenarioCards } from "../data/mockData.js";

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  const isLocal = typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  
  return isLocal ? "http://127.0.0.1:8000" : "/_/backend";
};

const API_BASE_URL = getApiBaseUrl();

async function request(path, options = {}, fallback) {
  const token = sessionStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Only fall back to mock data if it's a network error (TypeError from fetch).
    // If the server explicitly responded with an error (e.g. 400 Bad Request), propagate it.
    if (error.name === "TypeError" && fallback !== undefined) {
      console.info(`Using mock data for ${path} due to network error: ${error.message}`);
      return fallback;
    }
    throw error;
  }
}

export const api = {
  login(usernameOrEmail, password) {
    const mockUser = {
      username: usernameOrEmail.includes("@") ? usernameOrEmail.split("@")[0] : usernameOrEmail,
      email: usernameOrEmail.includes("@") ? usernameOrEmail : `${usernameOrEmail}@acme.com`
    };
    return request(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ username_or_email: usernameOrEmail, password })
      },
      { token: "mock-token-123", user: mockUser }
    );
  },
  signup(username, email, password) {
    return request(
      "/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({ username, email, password })
      },
      { message: "Registration successful (Mock).", username }
    );
  },
  getMe() {
    return request(
      "/auth/me",
      {},
      { user: { username: "analyst", email: "analyst@acme.com" } }
    );
  },
  logout() {
    return request(
      "/auth/logout",
      { method: "POST" },
      { message: "Logged out successfully (Mock)." }
    );
  },
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

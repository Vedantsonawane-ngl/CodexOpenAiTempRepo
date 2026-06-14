export const alerts = [
  {
    id: "ALT-1001",
    title: "Possible Account Compromise",
    severity: "High",
    affectedEntity: "riya@acme.com",
    createdTime: "09:15",
    status: "New",
    confidence: 82,
    description:
      "Repeated VPN login failures were followed by a successful login from RU, MFA bypass, suspicious DNS activity, payroll file access, and an external inbox forwarding rule.",
    investigationId: "INV-1001",
    reportId: "RPT-1001"
  },
  {
    id: "ALT-1002",
    title: "Possible Phishing Attempt",
    severity: "Medium",
    affectedEntity: "arjun@acme.com",
    createdTime: "10:18",
    status: "New",
    confidence: 76,
    description: "Payroll-themed phishing email led to URL click and credential submission.",
    investigationId: "INV-1002",
    reportId: "RPT-1002"
  },
  {
    id: "ALT-1003",
    title: "Possible Malware Beaconing",
    severity: "High",
    affectedEntity: "devika@acme.com",
    createdTime: "11:09",
    status: "Investigating",
    confidence: 84,
    description: "Endpoint process execution followed by repeated outbound connections to a suspicious domain.",
    investigationId: "INV-1003",
    reportId: "RPT-1003"
  },
  {
    id: "ALT-1004",
    title: "Possible Insider Data Access",
    severity: "High",
    affectedEntity: "meera@acme.com",
    createdTime: "22:41",
    status: "New",
    confidence: 79,
    description: "Sensitive finance files were accessed, archived, and uploaded to an external storage domain.",
    investigationId: "INV-1004",
    reportId: "RPT-1004"
  }
];

export const rawLogs = [
  {
    id: "LOG-CC-001",
    timestamp: "2026-06-14T09:12:04Z",
    displayTime: "09:12:04",
    source: "VPN",
    event: "vpn_failed",
    user: "riya@acme.com",
    ip: "185.199.110.44",
    country: "RU",
    host: "",
    domain: "",
    file: "",
    raw: "09:12:04 VPN failed login user=riya@acme.com ip=185.199.110.44 country=RU"
  },
  {
    id: "LOG-CC-002",
    timestamp: "2026-06-14T09:12:18Z",
    displayTime: "09:12:18",
    source: "VPN",
    event: "vpn_failed",
    user: "riya@acme.com",
    ip: "185.199.110.44",
    country: "RU",
    host: "",
    domain: "",
    file: "",
    raw: "09:12:18 VPN failed login user=riya@acme.com ip=185.199.110.44"
  },
  {
    id: "LOG-CC-003",
    timestamp: "2026-06-14T09:13:01Z",
    displayTime: "09:13:01",
    source: "VPN",
    event: "vpn_success",
    user: "riya@acme.com",
    ip: "185.199.110.44",
    country: "RU",
    host: "",
    domain: "",
    file: "",
    raw: "09:13:01 VPN success user=riya@acme.com ip=185.199.110.44 country=RU"
  },
  {
    id: "LOG-CC-004",
    timestamp: "2026-06-14T09:15:22Z",
    displayTime: "09:15:22",
    source: "Okta",
    event: "mfa_bypass",
    user: "riya@acme.com",
    ip: "185.199.110.44",
    country: "RU",
    host: "",
    domain: "",
    file: "",
    raw: "09:15:22 Okta MFA bypass user=riya@acme.com device=unknown"
  },
  {
    id: "LOG-CC-005",
    timestamp: "2026-06-14T09:18:45Z",
    displayTime: "09:18:45",
    source: "Endpoint",
    event: "endpoint_login",
    user: "riya",
    ip: "10.0.8.44",
    country: "IN",
    host: "LAPTOP-RIYA",
    domain: "",
    file: "",
    raw: "09:18:45 Endpoint login host=LAPTOP-RIYA user=riya"
  },
  {
    id: "LOG-CC-006",
    timestamp: "2026-06-14T09:22:10Z",
    displayTime: "09:22:10",
    source: "DNS",
    event: "dns_request",
    user: "riya",
    ip: "10.0.8.44",
    country: "IN",
    host: "LAPTOP-RIYA",
    domain: "secure-update-check.com",
    file: "",
    raw: "09:22:10 DNS request host=LAPTOP-RIYA domain=secure-update-check.com"
  },
  {
    id: "LOG-CC-007",
    timestamp: "2026-06-14T09:25:31Z",
    displayTime: "09:25:31",
    source: "File Server",
    event: "file_access",
    user: "riya",
    ip: "10.0.8.44",
    country: "IN",
    host: "LAPTOP-RIYA",
    domain: "",
    file: "/finance/payroll.xlsx",
    raw: "09:25:31 File access user=riya file=/finance/payroll.xlsx"
  },
  {
    id: "LOG-CC-008",
    timestamp: "2026-06-14T09:29:02Z",
    displayTime: "09:29:02",
    source: "Office 365",
    event: "new_inbox_rule",
    user: "riya",
    ip: "10.0.8.44",
    country: "IN",
    host: "",
    domain: "",
    file: "",
    raw: "09:29:02 New inbox rule user=riya action=forward_all_to_external"
  }
];

export const investigation = {
  id: "INV-1001",
  alertId: "ALT-1001",
  attackType: "Credential Compromise",
  severity: "High",
  confidence: 82,
  status: "Ready for Review",
  user: "riya@acme.com",
  suspiciousLocation: "RU",
  failedLoginCount: 2,
  summary:
    "Evidence indicates a likely account compromise. Multiple failed VPN attempts were followed by a successful login from RU, MFA bypass, suspicious DNS activity, payroll access, and an external inbox forwarding rule.",
  reasoning:
    "Multiple failed VPN login attempts were followed by a successful login from the same IP address. The login originated from RU and was followed by an MFA bypass, suspicious DNS activity, payroll file access, and creation of an external inbox forwarding rule.",
  timeline: [
    {
      id: "TL-001",
      time: "09:12:04",
      title: "VPN Failed Login",
      tone: "danger",
      user: "riya@acme.com",
      ip: "185.199.110.44",
      country: "RU",
      source: "VPN",
      rawLogId: "LOG-CC-001"
    },
    {
      id: "TL-002",
      time: "09:12:18",
      title: "VPN Failed Login",
      tone: "danger",
      user: "riya@acme.com",
      ip: "185.199.110.44",
      country: "RU",
      source: "VPN",
      rawLogId: "LOG-CC-002"
    },
    {
      id: "TL-003",
      time: "09:13:01",
      title: "VPN Successful Login",
      tone: "success",
      user: "riya@acme.com",
      ip: "185.199.110.44",
      country: "RU",
      source: "VPN",
      rawLogId: "LOG-CC-003"
    },
    {
      id: "TL-004",
      time: "09:15:22",
      title: "Okta MFA Bypass",
      tone: "critical",
      user: "riya@acme.com",
      ip: "185.199.110.44",
      country: "RU",
      source: "Okta",
      rawLogId: "LOG-CC-004"
    },
    {
      id: "TL-005",
      time: "09:18:45",
      title: "Endpoint Login",
      tone: "neutral",
      user: "riya",
      ip: "10.0.8.44",
      host: "LAPTOP-RIYA",
      source: "Endpoint",
      rawLogId: "LOG-CC-005"
    },
    {
      id: "TL-006",
      time: "09:22:10",
      title: "Suspicious DNS Request",
      tone: "warning",
      user: "riya",
      ip: "10.0.8.44",
      host: "LAPTOP-RIYA",
      domain: "secure-update-check.com",
      source: "DNS",
      rawLogId: "LOG-CC-006"
    },
    {
      id: "TL-007",
      time: "09:25:31",
      title: "Payroll File Access",
      tone: "warning",
      user: "riya",
      ip: "10.0.8.44",
      file: "/finance/payroll.xlsx",
      source: "File Server",
      rawLogId: "LOG-CC-007"
    },
    {
      id: "TL-008",
      time: "09:29:02",
      title: "New External Inbox Rule",
      tone: "critical",
      user: "riya",
      source: "Office 365",
      rawLogId: "LOG-CC-008"
    }
  ],
  entities: {
    Users: ["riya@acme.com", "riya"],
    "IP Addresses": ["185.199.110.44", "10.0.8.44"],
    Hosts: ["LAPTOP-RIYA"],
    Domains: ["secure-update-check.com"],
    Files: ["/finance/payroll.xlsx"],
    Countries: ["RU", "IN"]
  },
  findings: [
    {
      finding: "Brute Force",
      severity: "High",
      evidence: "2 failed logins",
      relatedEntities: ["riya@acme.com", "185.199.110.44"],
      sourceLogIds: ["LOG-CC-001", "LOG-CC-002"],
      status: "Supported by Evidence"
    },
    {
      finding: "Suspicious Location",
      severity: "High",
      evidence: "Login from RU",
      relatedEntities: ["riya@acme.com", "RU"],
      sourceLogIds: ["LOG-CC-003"],
      status: "Supported by Evidence"
    },
    {
      finding: "MFA Bypass",
      severity: "High",
      evidence: "MFA challenge bypassed from unknown device",
      relatedEntities: ["riya@acme.com"],
      sourceLogIds: ["LOG-CC-004"],
      status: "Supported by Evidence"
    },
    {
      finding: "External Mail Forwarding",
      severity: "High",
      evidence: "Inbox rule forwards all mail externally",
      relatedEntities: ["riya"],
      sourceLogIds: ["LOG-CC-008"],
      status: "Supported by Evidence"
    }
  ],
  mitre: [
    {
      techniqueId: "T1110",
      technique: "Brute Force",
      relatedFinding: "Brute Force",
      confidence: 88,
      sourceLogIds: ["LOG-CC-001", "LOG-CC-002"]
    },
    {
      techniqueId: "T1078",
      technique: "Valid Accounts",
      relatedFinding: "Suspicious Location",
      confidence: 82,
      sourceLogIds: ["LOG-CC-003"]
    },
    {
      techniqueId: "T1114",
      technique: "Email Collection",
      relatedFinding: "External Mail Forwarding",
      confidence: 74,
      sourceLogIds: ["LOG-CC-008"]
    }
  ],
  recommendations: ["Reset Password", "Revoke Sessions", "Block IP", "Disable Inbox Rule"]
};

export const approvals = investigation.recommendations.map((action, index) => ({
  id: `APR-${1001 + index}`,
  action,
  investigationId: "INV-1001",
  alertId: "ALT-1001",
  target: action === "Block IP" ? "185.199.110.44" : "riya@acme.com",
  reason: "Containment recommendation generated from evidence-backed investigation.",
  evidence: investigation.findings[Math.min(index, investigation.findings.length - 1)].evidence,
  riskImpact: action === "Block IP" ? "May block access from the suspicious source IP." : "May interrupt active user sessions.",
  status: "Pending Human Approval",
  requestedTime: "09:31"
}));

export const reports = [
  {
    id: "RPT-1001",
    investigationId: "INV-1001",
    alertId: "ALT-1001",
    title: "Possible Account Compromise",
    attackType: "Credential Compromise",
    severity: "High",
    confidence: 82,
    generatedAt: "2026-06-14T09:35:00Z",
    status: "Ready"
  }
];

export const scenarioCards = [
  {
    title: "Credential Compromise",
    severity: "High Severity",
    tone: "high",
    events: 8,
    description: "Simulated unauthorized access using stolen credentials across hybrid environments.",
    tags: ["VPN", "Okta", "Endpoint", "DNS", "O365", "Proxy"]
  },
  {
    title: "Phishing to Malware",
    severity: "Critical Severity",
    tone: "critical",
    events: 9,
    description: "Malicious payload delivery via email resulting in EDR detections and lateral movement.",
    tags: ["Email", "Endpoint", "DNS", "EDR"]
  },
  {
    title: "Malware Beaconing",
    severity: "High Severity",
    tone: "high",
    events: 7,
    description: "Abnormal outbound traffic patterns from an endpoint to suspicious command domains.",
    tags: ["Endpoint", "Proxy", "DNS"]
  },
  {
    title: "Insider Data Access",
    severity: "High Severity",
    tone: "high",
    events: 5,
    description: "Sensitive finance documents are accessed, archived, and uploaded to external storage.",
    tags: ["File Server", "Endpoint", "Proxy"]
  },
  {
    title: "False Positive Travel",
    severity: "Low Severity",
    tone: "low",
    events: 5,
    description: "Impossible travel alert triggered by executive travel and concurrent VPN maintenance.",
    tags: ["VPN", "HR", "Okta"]
  },
  {
    title: "Benign Admin Activity",
    severity: "Low Severity",
    tone: "low",
    events: 6,
    description: "Elevated privilege usage for routine patching and change management verification.",
    tags: ["IAM", "Endpoint", "Change Management"]
  }
];

export const normalizationPreview = [
  {
    timestamp: "2026-06-14T09:12:04Z",
    user: "riya@acme.com",
    ip: "185.199.110.44",
    host: "RU",
    action: "VPN_FAILED"
  },
  {
    timestamp: "2026-06-14T09:13:01Z",
    user: "riya@acme.com",
    ip: "185.199.110.44",
    host: "RU",
    action: "VPN_SUCCESS"
  },
  {
    timestamp: "2026-06-14T09:15:22Z",
    user: "riya@acme.com",
    ip: "185.199.110.44",
    host: "Okta",
    action: "MFA_BYPASS"
  },
  {
    timestamp: "2026-06-14T09:22:10Z",
    user: "riya",
    ip: "10.0.8.44",
    host: "secure-update-check.com",
    action: "DNS_REQUEST"
  }
];

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


REPO_ROOT = Path(__file__).resolve().parents[2]
SAMPLE_LOGS_DIR = REPO_ROOT / "sample_logs"
ALERTS_FILE = REPO_ROOT / "backend" / "app" / "sample_data" / "alerts.json"


class LogUpload(BaseModel):
    logs: list[dict[str, Any]] = []


class ApprovalDecision(BaseModel):
    comment: str | None = None


app = FastAPI(title="intelliSOC Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

approval_state: dict[str, dict[str, Any]] = {}


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def load_scenarios() -> list[dict[str, Any]]:
    scenarios = []
    for path in sorted(SAMPLE_LOGS_DIR.glob("*.json")):
        scenario = read_json(path)
        scenario["_file_name"] = path.name
        scenarios.append(scenario)
    return scenarios


def scenario_by_alert_id(alert_id: str) -> dict[str, Any]:
    for scenario in load_scenarios():
        if scenario["alert"]["alert_id"] == alert_id:
            return scenario
    raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")


def scenario_by_investigation_id(investigation_id: str) -> dict[str, Any]:
    alert_id = investigation_id.replace("INV-", "ALT-", 1)
    return scenario_by_alert_id(alert_id)


def scenario_by_report_id(report_id: str) -> dict[str, Any]:
    alert_id = report_id.replace("RPT-", "ALT-", 1)
    return scenario_by_alert_id(alert_id)


def to_display_time(timestamp: str) -> str:
    try:
        parsed = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        return parsed.strftime("%H:%M")
    except ValueError:
        return timestamp


def title_case_source(value: str) -> str:
    return value.replace("_", " ").replace("office365", "Office 365").title()


def alert_to_client(scenario: dict[str, Any]) -> dict[str, Any]:
    alert = scenario["alert"]
    expected = scenario["expected_investigation"]
    numeric_id = alert["alert_id"].split("-")[-1]
    return {
        "id": alert["alert_id"],
        "title": alert["title"],
        "severity": alert["severity"],
        "affectedEntity": alert["affected_user"],
        "createdTime": to_display_time(alert["detected_time"]),
        "status": alert["status"],
        "confidence": expected["confidence"],
        "description": scenario["description"],
        "investigationId": f"INV-{numeric_id}",
        "reportId": f"RPT-{numeric_id}",
        "scenarioId": scenario["scenario_id"],
    }


def log_to_client(log: dict[str, Any]) -> dict[str, Any]:
    item = dict(log)
    item["displayTime"] = item.pop("display_time", item.get("displayTime", ""))
    item["source"] = title_case_source(str(item.get("source", "")))
    return item


def entities_to_client(entities: dict[str, list[str]]) -> dict[str, list[str]]:
    return {
        "Users": entities.get("users", []),
        "IP Addresses": entities.get("ip_addresses", []),
        "Hosts": entities.get("hostnames", []),
        "Domains": entities.get("domains", []),
        "Files": entities.get("files", []),
        "Countries": entities.get("countries", []),
    }


def timeline_to_client(scenario: dict[str, Any]) -> list[dict[str, Any]]:
    logs_by_id = {log["id"]: log for log in scenario["logs"]}
    timeline = []
    for index, event in enumerate(scenario["expected_investigation"]["timeline"], start=1):
        source_log_ids = event.get("source_log_ids", [])
        first_log = logs_by_id.get(source_log_ids[0], {}) if source_log_ids else {}
        severity = scenario["expected_investigation"]["severity"]
        tone = "critical" if severity == "Critical" else "danger" if severity == "High" else "warning"
        timeline.append(
            {
                "id": f"TL-{index:03d}",
                "time": first_log.get("display_time", event["time"]),
                "title": event["title"],
                "tone": tone,
                "user": first_log.get("user", ""),
                "ip": first_log.get("ip", ""),
                "country": first_log.get("country", ""),
                "host": first_log.get("host", ""),
                "domain": first_log.get("domain", ""),
                "file": first_log.get("file", ""),
                "source": title_case_source(str(first_log.get("source", ""))),
                "rawLogId": source_log_ids[0] if source_log_ids else "",
                "sourceLogIds": source_log_ids,
            }
        )
    return timeline


def findings_to_client(scenario: dict[str, Any]) -> list[dict[str, Any]]:
    entities = scenario["expected_investigation"]["entities"]
    related_entities = [
        *entities.get("users", []),
        *entities.get("ip_addresses", []),
        *entities.get("domains", []),
        *entities.get("files", []),
    ]
    return [
        {
            "finding": finding["finding"],
            "severity": finding["severity"],
            "evidence": finding["evidence"],
            "relatedEntities": related_entities[:4],
            "sourceLogIds": finding.get("source_log_ids", []),
            "status": "Supported by Evidence",
        }
        for finding in scenario["expected_investigation"]["findings"]
    ]


def mitre_to_client(scenario: dict[str, Any]) -> list[dict[str, Any]]:
    findings = scenario["expected_investigation"]["findings"]
    first_finding = findings[0]["finding"] if findings else "Correlated Finding"
    confidence = scenario["expected_investigation"]["confidence"]
    return [
        {
            "techniqueId": item["technique_id"],
            "technique": item["technique"],
            "relatedFinding": first_finding,
            "confidence": confidence,
            "sourceLogIds": item.get("source_log_ids", []),
        }
        for item in scenario["expected_investigation"].get("mitre", [])
    ]


def investigation_to_client(scenario: dict[str, Any]) -> dict[str, Any]:
    alert = alert_to_client(scenario)
    expected = scenario["expected_investigation"]
    logs = scenario["logs"]
    failed_logins = len([log for log in logs if log.get("event") == "vpn_failed"])
    countries = expected["entities"].get("countries", [])
    suspicious_location = next((country for country in countries if country not in {"IN", "US"}), countries[0] if countries else "")
    return {
        "id": alert["investigationId"],
        "alertId": alert["id"],
        "attackType": expected["attack_type"],
        "severity": expected["severity"],
        "confidence": expected["confidence"],
        "status": "Ready for Review",
        "user": alert["affectedEntity"],
        "suspiciousLocation": suspicious_location,
        "failedLoginCount": failed_logins,
        "summary": expected["summary"],
        "reasoning": expected["summary"],
        "timeline": timeline_to_client(scenario),
        "entities": entities_to_client(expected["entities"]),
        "findings": findings_to_client(scenario),
        "mitre": mitre_to_client(scenario),
        "recommendations": expected["recommendations"],
        "logs": [log_to_client(log) for log in logs],
        "reportId": alert["reportId"],
    }


def approvals_for_investigation(investigation: dict[str, Any]) -> list[dict[str, Any]]:
    findings = investigation["findings"] or [{"evidence": "Correlated investigation evidence"}]
    approvals = []
    for index, action in enumerate(investigation["recommendations"], start=1):
        action_id = f"APR-{investigation['id'].split('-')[-1]}-{index:02d}"
        saved_state = approval_state.get(action_id, {})
        target = (
            investigation["entities"].get("IP Addresses", [""])[0]
            if "IP" in action or "Domain" not in action
            else investigation["entities"].get("Domains", [""])[0]
        )
        approvals.append(
            {
                "id": action_id,
                "action": action,
                "investigationId": investigation["id"],
                "alertId": investigation["alertId"],
                "target": target or investigation["user"],
                "reason": "Containment recommendation generated from evidence-backed investigation.",
                "evidence": findings[min(index - 1, len(findings) - 1)]["evidence"],
                "riskImpact": "May interrupt active access or block related infrastructure.",
                "status": saved_state.get("status", "Pending Human Approval"),
                "requestedTime": "Now",
                "comment": saved_state.get("comment", ""),
            }
        )
    return approvals


def report_to_client(scenario: dict[str, Any]) -> dict[str, Any]:
    alert = alert_to_client(scenario)
    investigation = investigation_to_client(scenario)
    return {
        "id": alert["reportId"],
        "investigationId": alert["investigationId"],
        "alertId": alert["id"],
        "title": alert["title"],
        "attackType": investigation["attackType"],
        "severity": investigation["severity"],
        "confidence": investigation["confidence"],
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "status": "Ready",
        "summary": investigation["summary"],
        "investigation": investigation,
        "rawLogs": investigation["logs"],
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/scenarios")
def get_scenarios() -> list[dict[str, Any]]:
    scenarios = []
    for scenario in load_scenarios():
        alert = alert_to_client(scenario)
        tags = sorted({title_case_source(str(log.get("source", ""))) for log in scenario["logs"] if log.get("source")})
        severity = alert["severity"]
        scenarios.append(
            {
                "id": scenario["scenario_id"],
                "title": scenario["name"],
                "description": scenario["description"],
                "severity": f"{severity} Severity",
                "tone": severity.lower(),
                "tags": tags,
                "alert": alert,
                "events": len(scenario["logs"]),
            }
        )
    return scenarios


@app.get("/alerts")
def get_alerts() -> list[dict[str, Any]]:
    return [alert_to_client(scenario) for scenario in load_scenarios()]


@app.get("/alerts/{alert_id}")
def get_alert(alert_id: str) -> dict[str, Any]:
    scenario = scenario_by_alert_id(alert_id)
    alert = alert_to_client(scenario)
    investigation = investigation_to_client(scenario)
    return {**alert, "logs": investigation["logs"], "entities": investigation["entities"]}


@app.post("/logs/upload")
def upload_logs(payload: LogUpload) -> dict[str, Any]:
    scenarios = load_scenarios()
    detected_alerts = [alert_to_client(scenario) for scenario in scenarios[:1]]
    processed = len(payload.logs) if payload.logs else sum(len(scenario["logs"]) for scenario in scenarios)
    return {"processed": processed, "detected_alerts": detected_alerts, "status": "accepted"}


@app.post("/investigations/run/{alert_id}")
def run_investigation(alert_id: str) -> dict[str, Any]:
    return investigation_to_client(scenario_by_alert_id(alert_id))


@app.get("/investigations/{investigation_id}")
def get_investigation(investigation_id: str) -> dict[str, Any]:
    return investigation_to_client(scenario_by_investigation_id(investigation_id))


@app.get("/approvals")
def get_approvals() -> list[dict[str, Any]]:
    approvals: list[dict[str, Any]] = []
    for scenario in load_scenarios():
        approvals.extend(approvals_for_investigation(investigation_to_client(scenario)))
    return approvals


@app.post("/approvals/{action_id}/approve")
def approve_action(action_id: str, payload: ApprovalDecision) -> dict[str, Any]:
    approval_state[action_id] = {"status": "Approved", "comment": payload.comment or ""}
    return {"id": action_id, **approval_state[action_id]}


@app.post("/approvals/{action_id}/reject")
def reject_action(action_id: str, payload: ApprovalDecision) -> dict[str, Any]:
    approval_state[action_id] = {"status": "Rejected", "comment": payload.comment or ""}
    return {"id": action_id, **approval_state[action_id]}


@app.get("/reports")
def get_reports() -> list[dict[str, Any]]:
    return [report_to_client(scenario) for scenario in load_scenarios()]


@app.get("/reports/{report_id}")
def get_report(report_id: str) -> dict[str, Any]:
    return report_to_client(scenario_by_report_id(report_id))

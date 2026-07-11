from __future__ import annotations

import json
import logging
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from groq import AsyncGroq
from pydantic import BaseModel, field_validator
import hashlib
import secrets

load_dotenv()

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("intellisoc")

# ── Paths ─────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[2]
SAMPLE_LOGS_DIR = REPO_ROOT / "sample_logs"
ALERTS_FILE = REPO_ROOT / "backend" / "app" / "sample_data" / "alerts.json"
USERS_FILE = REPO_ROOT / "backend" / "app" / "sample_data" / "users.json"

# ── Groq client ───────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"

groq_client: AsyncGroq | None = None
if GROQ_API_KEY:
    groq_client = AsyncGroq(api_key=GROQ_API_KEY)
    logger.info("Groq AI client initialized with model: %s", GROQ_MODEL)
else:
    logger.warning("GROQ_API_KEY not set — AI investigation will use static fallback.")


# ── Pydantic models ───────────────────────────────────────────────────────────
class LogUpload(BaseModel):
    logs: list[dict[str, Any]] = []

    @field_validator("logs")
    @classmethod
    def logs_must_not_exceed_limit(cls, v: list) -> list:
        if len(v) > 10_000:
            raise ValueError("Maximum 10,000 log entries per upload.")
        return v


class ApprovalDecision(BaseModel):
    comment: str | None = None

    @field_validator("comment")
    @classmethod
    def sanitize_comment(cls, v: str | None) -> str | None:
        if v and len(v) > 1000:
            raise ValueError("Comment must be under 1000 characters.")
        return v


# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="IntelliSOC Backend",
    version="2.0.0",
    description="AI-powered SOC log triage backend using Groq LLaMA 3.3 70B.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request logging middleware ────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s → %d (%.1fms)",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


# ── In-memory state ───────────────────────────────────────────────────────────
approval_state: dict[str, dict[str, Any]] = {}
active_sessions: dict[str, dict[str, Any]] = {}


# ── File I/O (async) ──────────────────────────────────────────────────────────
async def read_json_async(path: Path) -> Any:
    """Read a JSON file asynchronously using a thread pool to avoid blocking."""
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _read_json_sync, path)


def _read_json_sync(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


class SignupRequest(BaseModel):
    username: str
    email: str
    password: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Username cannot be empty.")
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters.")
        if not v.isalnum():
            raise ValueError("Username must be alphanumeric.")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v:
            raise ValueError("Invalid email address.")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters.")
        return v


class LoginRequest(BaseModel):
    username_or_email: str
    password: str


def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()
    return pw_hash, salt


def verify_password(password: str, pw_hash: str, salt: str) -> bool:
    expected_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(expected_hash, pw_hash)


async def load_users_async() -> list[dict[str, Any]]:
    if not USERS_FILE.exists():
        return []
    try:
        return await read_json_async(USERS_FILE)
    except Exception as e:
        logger.error("Failed to load users: %s", e)
        return []


def _write_json_sync_data(path: Path, data: Any) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


async def save_users_async(users: list[dict[str, Any]]) -> None:
    import asyncio
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _write_json_sync_data, USERS_FILE, users)


async def get_current_user(authorization: str | None = Header(None)) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication credentials missing or invalid.")
    token = authorization.split("Bearer ", 1)[1].strip()
    user_info = active_sessions.get(token)
    if not user_info:
        raise HTTPException(status_code=401, detail="Session expired or invalid token.")
    return user_info


async def load_scenarios_async() -> list[dict[str, Any]]:
    """Load all scenario JSON files from sample_logs directory asynchronously."""
    import asyncio
    if not SAMPLE_LOGS_DIR.exists():
        logger.warning("sample_logs directory not found at: %s", SAMPLE_LOGS_DIR)
        return []
    paths = sorted(SAMPLE_LOGS_DIR.glob("*.json"))
    if not paths:
        logger.warning("No JSON scenario files found in sample_logs/")
        return []
    tasks = [read_json_async(p) for p in paths]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    scenarios = []
    for path, result in zip(paths, results):
        if isinstance(result, Exception):
            logger.error("Failed to load scenario %s: %s", path.name, result)
            continue
        result["_file_name"] = path.name
        scenarios.append(result)
    return scenarios


async def get_scenario_by_alert_id(alert_id: str) -> dict[str, Any]:
    for scenario in await load_scenarios_async():
        if scenario["alert"]["alert_id"] == alert_id:
            return scenario
    raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")


async def get_scenario_by_investigation_id(investigation_id: str) -> dict[str, Any]:
    return await get_scenario_by_alert_id(investigation_id.replace("INV-", "ALT-", 1))


async def get_scenario_by_report_id(report_id: str) -> dict[str, Any]:
    return await get_scenario_by_alert_id(report_id.replace("RPT-", "ALT-", 1))


# ── Data transformation helpers ───────────────────────────────────────────────
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
        timeline.append({
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
        })
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
            "finding": f["finding"],
            "severity": f["severity"],
            "evidence": f["evidence"],
            "relatedEntities": related_entities[:4],
            "sourceLogIds": f.get("source_log_ids", []),
            "status": "Supported by Evidence",
        }
        for f in scenario["expected_investigation"]["findings"]
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
    suspicious_location = next(
        (c for c in countries if c not in {"IN", "US"}),
        countries[0] if countries else "",
    )
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
        approvals.append({
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
        })
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


# ── AI Investigation ──────────────────────────────────────────────────────────
AI_SYSTEM_PROMPT = """You are IntelliSOC, an expert SOC (Security Operations Center) analyst AI.
You will be given a security alert and associated log entries.

Analyze the logs and produce a structured JSON investigation report. Be precise, evidence-based, and decisive.

Respond ONLY with a valid JSON object with this structure:
{
  "attack_type": "e.g. Brute Force, Credential Stuffing, Lateral Movement, Data Exfiltration, etc.",
  "severity": "Critical | High | Medium | Low",
  "confidence": "High | Medium | Low",
  "summary": "3-4 sentence plain-language summary of what happened, who was affected, and the likely attacker intent.",
  "key_findings": [
    {
      "finding": "Short title of the finding",
      "severity": "Critical | High | Medium | Low",
      "evidence": "Specific log-based evidence supporting this finding."
    }
  ],
  "recommendations": [
    "Specific actionable remediation step 1",
    "Specific actionable remediation step 2"
  ],
  "mitre_techniques": [
    {
      "technique_id": "e.g. T1110",
      "technique": "e.g. Brute Force",
      "rationale": "Why this technique applies based on the logs."
    }
  ]
}

Do not include markdown, code fences, or any text outside the JSON object."""


async def run_ai_investigation(scenario: dict[str, Any]) -> dict[str, Any]:
    """
    Call Groq LLaMA 3.3 70B to generate a real AI investigation from log data.
    Falls back to static expected_investigation if Groq is unavailable.
    """
    if not groq_client:
        logger.warning("Groq client not available — returning static investigation.")
        return investigation_to_client(scenario)

    alert = scenario["alert"]
    logs_preview = scenario["logs"][:20]  # cap to avoid token overflow

    user_prompt = f"""Security Alert:
- Title: {alert['title']}
- Affected User: {alert['affected_user']}
- Detected At: {alert['detected_time']}
- Status: {alert['status']}
- Description: {scenario['description']}

Log Entries ({len(scenario['logs'])} total, showing first {len(logs_preview)}):
{json.dumps(logs_preview, indent=2)}

Analyze these logs and produce a full investigation report as a JSON object."""

    try:
        logger.info("Running AI investigation for alert: %s", alert["alert_id"])
        start = time.perf_counter()

        response = await groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": AI_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,      # low temp = more deterministic, factual output
            max_tokens=2048,
        )

        duration_ms = (time.perf_counter() - start) * 1000
        logger.info("AI investigation completed in %.1fms", duration_ms)

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        ai_result = json.loads(raw)

        # Merge AI output with base investigation structure
        base = investigation_to_client(scenario)
        base["attackType"] = ai_result.get("attack_type", base["attackType"])
        base["severity"] = ai_result.get("severity", base["severity"])
        base["confidence"] = ai_result.get("confidence", base["confidence"])
        base["summary"] = ai_result.get("summary", base["summary"])
        base["reasoning"] = ai_result.get("summary", base["reasoning"])
        base["recommendations"] = ai_result.get("recommendations", base["recommendations"])
        base["aiGenerated"] = True
        base["model"] = GROQ_MODEL

        # Map AI findings into client format
        if ai_result.get("key_findings"):
            base["findings"] = [
                {
                    "finding": f["finding"],
                    "severity": f["severity"],
                    "evidence": f["evidence"],
                    "relatedEntities": [],
                    "sourceLogIds": [],
                    "status": "AI Generated",
                }
                for f in ai_result["key_findings"]
            ]

        # Map MITRE techniques
        if ai_result.get("mitre_techniques"):
            base["mitre"] = [
                {
                    "techniqueId": t["technique_id"],
                    "technique": t["technique"],
                    "relatedFinding": t.get("rationale", ""),
                    "confidence": ai_result.get("confidence", "Medium"),
                    "sourceLogIds": [],
                }
                for t in ai_result["mitre_techniques"]
            ]

        return base

    except json.JSONDecodeError as e:
        logger.error("Failed to parse AI response as JSON: %s", e)
        return investigation_to_client(scenario)
    except Exception as e:
        logger.error("Groq API error during investigation: %s", e)
        return investigation_to_client(scenario)


# ── Routes ────────────────────────────────────────────────────────────────────
# ── Authentication Routes ─────────────────────────────────────────────────────
@app.post("/auth/signup")
async def signup(payload: SignupRequest) -> dict[str, Any]:
    users = await load_users_async()
    for user in users:
        if user["username"].lower() == payload.username.lower():
            raise HTTPException(status_code=400, detail="Username is already taken.")
        if user["email"].lower() == payload.email.lower():
            raise HTTPException(status_code=400, detail="Email is already registered.")

    pw_hash, salt = hash_password(payload.password)
    new_user = {
        "username": payload.username,
        "email": payload.email,
        "password_hash": pw_hash,
        "salt": salt,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    users.append(new_user)
    await save_users_async(users)
    logger.info("New user registered: %s", payload.username)
    return {"message": "Registration successful.", "username": payload.username}


@app.post("/auth/login")
async def login(payload: LoginRequest) -> dict[str, Any]:
    users = await load_users_async()
    target_user = None
    search_term = payload.username_or_email.strip().lower()
    for user in users:
        if user["username"].lower() == search_term or user["email"].lower() == search_term:
            target_user = user
            break

    if not target_user or not verify_password(payload.password, target_user["password_hash"], target_user["salt"]):
        raise HTTPException(status_code=400, detail="Invalid username/email or password.")

    token = secrets.token_hex(32)
    user_info = {
        "username": target_user["username"],
        "email": target_user["email"]
    }
    active_sessions[token] = user_info
    logger.info("User logged in: %s", target_user["username"])
    return {"token": token, "user": user_info}


@app.get("/auth/me")
async def get_me(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    return {"user": current_user}


@app.post("/auth/logout")
async def logout(authorization: str | None = Header(None)) -> dict[str, Any]:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
        active_sessions.pop(token, None)
    return {"message": "Logged out successfully."}


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "version": "2.0.0",
        "ai_enabled": groq_client is not None,
        "model": GROQ_MODEL if groq_client else None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/scenarios", dependencies=[Depends(get_current_user)])
async def get_scenarios() -> list[dict[str, Any]]:
    scenarios = []
    for scenario in await load_scenarios_async():
        alert = alert_to_client(scenario)
        tags = sorted({
            title_case_source(str(log.get("source", "")))
            for log in scenario["logs"] if log.get("source")
        })
        severity = alert["severity"]
        scenarios.append({
            "id": scenario["scenario_id"],
            "title": scenario["name"],
            "description": scenario["description"],
            "severity": f"{severity} Severity",
            "tone": severity.lower(),
            "tags": tags,
            "alert": alert,
            "events": len(scenario["logs"]),
        })
    return scenarios


@app.get("/alerts", dependencies=[Depends(get_current_user)])
async def get_alerts() -> list[dict[str, Any]]:
    return [alert_to_client(s) for s in await load_scenarios_async()]


@app.get("/alerts/{alert_id}", dependencies=[Depends(get_current_user)])
async def get_alert(alert_id: str) -> dict[str, Any]:
    scenario = await get_scenario_by_alert_id(alert_id)
    alert = alert_to_client(scenario)
    investigation = investigation_to_client(scenario)
    return {**alert, "logs": investigation["logs"], "entities": investigation["entities"]}


@app.post("/logs/upload", dependencies=[Depends(get_current_user)])
async def upload_logs(payload: LogUpload) -> dict[str, Any]:
    scenarios = await load_scenarios_async()
    detected_alerts = [alert_to_client(s) for s in scenarios[:1]]
    processed = len(payload.logs) if payload.logs else sum(len(s["logs"]) for s in scenarios)
    logger.info("Log upload received: %d entries processed.", processed)
    return {"processed": processed, "detected_alerts": detected_alerts, "status": "accepted"}


@app.post("/investigations/run/{alert_id}", dependencies=[Depends(get_current_user)])
async def run_investigation(alert_id: str) -> dict[str, Any]:
    """
    Run a full AI-powered investigation on the given alert.
    Uses Groq LLaMA 3.3 70B if API key is configured, otherwise falls back to static data.
    """
    scenario = await get_scenario_by_alert_id(alert_id)
    return await run_ai_investigation(scenario)


@app.get("/investigations/{investigation_id}", dependencies=[Depends(get_current_user)])
async def get_investigation(investigation_id: str) -> dict[str, Any]:
    scenario = await get_scenario_by_investigation_id(investigation_id)
    return investigation_to_client(scenario)


@app.get("/approvals", dependencies=[Depends(get_current_user)])
async def get_approvals() -> list[dict[str, Any]]:
    approvals: list[dict[str, Any]] = []
    for scenario in await load_scenarios_async():
        approvals.extend(approvals_for_investigation(investigation_to_client(scenario)))
    return approvals


@app.post("/approvals/{action_id}/approve", dependencies=[Depends(get_current_user)])
async def approve_action(action_id: str, payload: ApprovalDecision) -> dict[str, Any]:
    approval_state[action_id] = {"status": "Approved", "comment": payload.comment or ""}
    logger.info("Action %s approved.", action_id)
    return {"id": action_id, **approval_state[action_id]}


@app.post("/approvals/{action_id}/reject", dependencies=[Depends(get_current_user)])
async def reject_action(action_id: str, payload: ApprovalDecision) -> dict[str, Any]:
    approval_state[action_id] = {"status": "Rejected", "comment": payload.comment or ""}
    logger.info("Action %s rejected.", action_id)
    return {"id": action_id, **approval_state[action_id]}


@app.get("/reports", dependencies=[Depends(get_current_user)])
async def get_reports() -> list[dict[str, Any]]:
    return [report_to_client(s) for s in await load_scenarios_async()]


@app.get("/reports/{report_id}", dependencies=[Depends(get_current_user)])
async def get_report(report_id: str) -> dict[str, Any]:
    scenario = await get_scenario_by_report_id(report_id)
    return report_to_client(scenario)
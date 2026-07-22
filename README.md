# intelliSOC / Agentic SOC

This repository contains the structured intelliSOC / Agentic SOC project with sample security logs and a React frontend converted from the original HTML UI.

## Project Structure

```text
frontend/
backend/
sample_logs/
docs/
```

## Frontend

Location:

```text
frontend
```

Run locally:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Backend

Location:

```text
backend
```

Run locally:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The React app calls this API by default:

```text
http://127.0.0.1:8000
```

Build:

```bash
npm run build
```

## Sample Data

Location:

```text
sample_logs
```

Legacy HTML references are preserved in:

```text
docs/legacy-html
```

Included scenarios:

- Credential Compromise
- Phishing
- Malware Beaconing
- Insider Data Access


USERNAME :- vedanthuyaar
Password :- ved123
